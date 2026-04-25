package backend.service;

import backend.api.dto.BookingDtos;
import backend.config.BookingApprovalRulesProperties;
import backend.exception.ConflictException;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.Booking;
import backend.model.BookingAuditEvent;
import backend.model.BookingStatus;
import backend.model.CampusResource;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.BookingRepository;
import backend.repository.CampusResourceRepository;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final BookingRepository bookingRepository;
	private final CampusResourceRepository resourceRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;
	private final BookingApprovalRulesProperties approvalRules;

	@Transactional(readOnly = true)
	public List<BookingDtos.BookingResponse> listFor(SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			return bookingRepository.findAll().stream()
					.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
					.map(this::toResponse)
					.toList();
		}
		return bookingRepository.findByUserIdOrderByCreatedAtDesc(u.getId()).stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public BookingDtos.BookingResponse get(String id, SecurityUser principal) {
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		assertCanView(b, principal);
		return toResponse(b);
	}

	@Transactional
	public BookingDtos.BookingResponse create(SecurityUser principal, BookingDtos.CreateRequest req) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		var resource = resourceRepository.findById(req.resourceId())
				.orElseThrow(() -> new NotFoundException("Resource not found"));

		// Rule: block creating a booking if it overlaps ANY existing booking
		// (PENDING or APPROVED) for this resource/date.
		List<Booking> sameDay = bookingRepository.findByResourceIdAndBookingDate(
				resource.getId(),
				req.bookingDate());
		boolean hasAnyOverlap = sameDay.stream()
				.filter(this::blocksSlot)
				.anyMatch(b -> overlaps(b, req.startTime(), req.endTime()));
		if (hasAnyOverlap) {
			throw new ConflictException("Already booked");
		}

		Instant now = Instant.now();
		Booking b = Booking.builder()
				.id(UUID.randomUUID().toString())
				.resourceId(resource.getId())
				.userId(u.getId())
				.bookingDate(req.bookingDate())
				.startTime(req.startTime())
				.endTime(req.endTime())
				.purpose(req.purpose())
				.attendees(req.attendees())
				.status(BookingStatus.PENDING)
				.createdAt(now)
				.updatedAt(now)
				.audit(new ArrayList<>())
				.build();

		appendAudit(b, "CREATED", null, BookingStatus.PENDING, u, null);

		if (shouldAutoApprove(b, resource)) {
			b.setStatus(BookingStatus.APPROVED);
			b.setReviewReason("Auto-approved");
			appendAudit(b, "AUTO_APPROVED", BookingStatus.PENDING, BookingStatus.APPROVED, null, "Met auto-approval rules");
		}

		b = bookingRepository.save(b);

		notificationService.create(
				u.getId(),
				"BOOKING_CREATED",
				"Booking request submitted",
				"Your booking request for " + resource.getName() + " on " + b.getBookingDate()
						+ " (" + b.getStartTime() + "–" + b.getEndTime() + ") was submitted.",
				b.getId());

		if (b.getStatus() == BookingStatus.APPROVED) {
			notificationService.create(
					u.getId(),
					"BOOKING_AUTO_APPROVED",
					"Booking auto-approved",
					"Your booking for " + resource.getName() + " on " + b.getBookingDate()
							+ " (" + b.getStartTime() + "–" + b.getEndTime() + ") was auto-approved.",
					b.getId());
			notificationService.notifyAdmins(
					"BOOKING_AUTO_APPROVED",
					"Booking auto-approved",
					u.getName() + " booking for " + resource.getName() + " on " + b.getBookingDate()
							+ " (" + b.getStartTime() + "–" + b.getEndTime() + ") was auto-approved.",
					b.getId());
		} else {
			notificationService.notifyAdmins(
					"BOOKING_CREATED",
					"New booking request",
					u.getName() + " requested " + resource.getName() + " on " + b.getBookingDate()
							+ " (" + b.getStartTime() + "–" + b.getEndTime() + ").",
					b.getId());
		}

		return toResponse(b);
	}

	@Transactional
	public BookingDtos.BookingResponse updateStatus(
			String id,
			BookingDtos.StatusUpdateRequest req,
			SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		final BookingStatus prevStatus = b.getStatus();

		// When approving, ensure only ONE booking can win a slot.
		if (req.status() == BookingStatus.APPROVED) {
			final String bookingId = b.getId();
			final String slotStart = b.getStartTime();
			final String slotEnd = b.getEndTime();
			final String resourceId = b.getResourceId();
			final var bookingDate = b.getBookingDate();

			List<Booking> sameDay = bookingRepository.findByResourceIdAndBookingDate(
					resourceId,
					bookingDate);
			boolean otherApprovedOverlap = sameDay.stream()
					.filter(x -> !x.getId().equals(bookingId))
					.filter(x -> x.getStatus() == BookingStatus.APPROVED)
					.anyMatch(x -> overlaps(x, slotStart, slotEnd));
			if (otherApprovedOverlap) {
				// Auto-reject if an admin attempts to approve a booking for an already booked slot.
				b.setStatus(BookingStatus.REJECTED);
				b.setReviewReason("Time slot already booked");
				b.setUpdatedAt(Instant.now());
				appendAudit(b, "REJECTED", prevStatus, BookingStatus.REJECTED, u, b.getReviewReason());
				b = bookingRepository.save(b);
				var resourceName = resourceRepository.findById(b.getResourceId()).map(r -> r.getName()).orElse("Unknown");
				notificationService.create(
						b.getUserId(),
						"BOOKING_AUTO_REJECTED",
						"Booking not available",
						"Your booking for " + resourceName + " on " + b.getBookingDate() + " (" + b.getStartTime() + "–" + b.getEndTime() + ") was rejected because the time slot was taken.",
						b.getId());
				return toResponse(b);
			}

			b.setStatus(BookingStatus.APPROVED);
			b.setReviewReason(req.reviewReason());
			b.setUpdatedAt(Instant.now());
			appendAudit(b, "APPROVED", prevStatus, BookingStatus.APPROVED, u, b.getReviewReason());
			b = bookingRepository.save(b);

			var resourceName = resourceRepository.findById(b.getResourceId()).map(r -> r.getName()).orElse("Unknown");
			notificationService.create(
					b.getUserId(),
					"BOOKING_APPROVED",
					"Booking approved",
					"Your booking for " + resourceName + " on " + b.getBookingDate() + " (" + b.getStartTime() + "–" + b.getEndTime() + ") was approved.",
					b.getId());

			// Auto-reject other pending overlaps for the same slot.
			List<Booking> toReject = sameDay.stream()
					.filter(x -> !x.getId().equals(bookingId))
					.filter(x -> x.getStatus() == BookingStatus.PENDING)
					.filter(x -> overlaps(x, slotStart, slotEnd))
					.toList();
			for (Booking x : toReject) {
				x.setStatus(BookingStatus.REJECTED);
				x.setReviewReason("Time slot already booked");
				x.setUpdatedAt(Instant.now());
				appendAudit(x, "AUTO_REJECTED", BookingStatus.PENDING, BookingStatus.REJECTED, null, x.getReviewReason());
				x = bookingRepository.save(x);
				var rn = resourceRepository.findById(x.getResourceId()).map(r -> r.getName()).orElse("Unknown");
				notificationService.create(
						x.getUserId(),
						"BOOKING_AUTO_REJECTED",
						"Booking not available",
						"Your booking for " + rn + " on " + x.getBookingDate() + " (" + x.getStartTime() + "–" + x.getEndTime() + ") was rejected because the time slot was taken.",
						x.getId());
			}

			return toResponse(b);
		}

		b.setStatus(req.status());
		b.setReviewReason(req.reviewReason());
		b.setUpdatedAt(Instant.now());
		if (!Objects.equals(prevStatus, b.getStatus())) {
			appendAudit(b, b.getStatus() == BookingStatus.REJECTED ? "REJECTED" : "STATUS_CHANGED", prevStatus, b.getStatus(), u, b.getReviewReason());
		}
		b = bookingRepository.save(b);

		if (b.getStatus() != null && b.getStatus() != prevStatus) {
			var resourceName = resourceRepository.findById(b.getResourceId()).map(r -> r.getName()).orElse("Unknown");
			if (b.getStatus() == BookingStatus.REJECTED) {
				String reason = b.getReviewReason();
				String msg = (reason == null || reason.isBlank())
						? "Your booking for " + resourceName + " on " + b.getBookingDate() + " (" + b.getStartTime() + "–" + b.getEndTime() + ") was rejected."
						: "Your booking for " + resourceName + " on " + b.getBookingDate() + " (" + b.getStartTime() + "–" + b.getEndTime() + ") was rejected. Reason: " + reason;
				notificationService.create(
						b.getUserId(),
						"BOOKING_REJECTED",
						"Booking rejected",
						msg,
						b.getId());
			}
		}

		return toResponse(b);
	}

	@Transactional(readOnly = true)
	public List<BookingDtos.BookingResponse> listBookedResources(SecurityUser principal) {
		// Any authenticated user can view approved bookings to avoid conflicts.
		userRepository.findById(principal.getUsername()).orElseThrow();
		return bookingRepository.findByStatus(BookingStatus.APPROVED).stream()
				.sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public BookingDtos.BookingResponse update(String id, BookingDtos.UpdateRequest req, SecurityUser principal) {
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		if (!b.getUserId().equals(u.getId())) {
			throw new ForbiddenException();
		}
		if (b.getStatus() != BookingStatus.PENDING) {
			throw new ConflictException("Only pending bookings can be updated");
		}

		// Block updates into any existing overlapping booking (pending or approved).
		List<Booking> sameDay = bookingRepository.findByResourceIdAndBookingDate(
				b.getResourceId(),
				req.bookingDate());
		boolean hasAnyOverlap = sameDay.stream()
				.filter(x -> !x.getId().equals(b.getId()))
				.filter(this::blocksSlot)
				.anyMatch(x -> overlaps(x, req.startTime(), req.endTime()));
		if (hasAnyOverlap) {
			throw new ConflictException("Already booked");
		}

		b.setBookingDate(req.bookingDate());
		b.setStartTime(req.startTime());
		b.setEndTime(req.endTime());
		b.setPurpose(req.purpose());
		b.setAttendees(req.attendees());
		b.setUpdatedAt(Instant.now());
		appendAudit(b, "UPDATED", BookingStatus.PENDING, BookingStatus.PENDING, u, "User updated booking details");

		// Re-check auto-approval rules after a user update (still pending).
		var resource = resourceRepository.findById(b.getResourceId()).orElse(null);
		if (resource != null && shouldAutoApprove(b, resource)) {
			b.setStatus(BookingStatus.APPROVED);
			b.setReviewReason("Auto-approved");
			appendAudit(b, "AUTO_APPROVED", BookingStatus.PENDING, BookingStatus.APPROVED, null, "Met auto-approval rules");
		}

		return toResponse(bookingRepository.save(b));
	}

	@Transactional
	public BookingDtos.BookingResponse adminUpdate(String id, BookingDtos.UpdateRequest req, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		final BookingStatus prevStatus = b.getStatus();
		final String bookingId = b.getId();

		// Admin can edit, but still cannot create overlapping slots.
		List<Booking> sameDay = bookingRepository.findByResourceIdAndBookingDate(
				b.getResourceId(),
				req.bookingDate());
		boolean anyOverlap = sameDay.stream()
				.filter(x -> !x.getId().equals(bookingId))
				.filter(this::blocksSlot)
				.anyMatch(x -> overlaps(x, req.startTime(), req.endTime()));
		if (anyOverlap) {
			throw new ConflictException("Already booked");
		}

		b.setBookingDate(req.bookingDate());
		b.setStartTime(req.startTime());
		b.setEndTime(req.endTime());
		b.setPurpose(req.purpose());
		b.setAttendees(req.attendees());
		b.setUpdatedAt(Instant.now());
		appendAudit(b, "ADMIN_EDIT", prevStatus, b.getStatus(), u, "Admin edited booking details");
		b = bookingRepository.save(b);

		// If this booking is approved, reject pending overlaps for the updated slot.
		if (b.getStatus() == BookingStatus.APPROVED) {
			final String slotStart = b.getStartTime();
			final String slotEnd = b.getEndTime();
			List<Booking> toReject = sameDay.stream()
					.filter(x -> !x.getId().equals(bookingId))
					.filter(x -> x.getStatus() == BookingStatus.PENDING)
					.filter(x -> overlaps(x, slotStart, slotEnd))
					.toList();
			for (Booking x : toReject) {
				x.setStatus(BookingStatus.REJECTED);
				x.setReviewReason("Time slot already booked");
				x.setUpdatedAt(Instant.now());
				appendAudit(x, "AUTO_REJECTED", BookingStatus.PENDING, BookingStatus.REJECTED, null, x.getReviewReason());
				bookingRepository.save(x);
			}
		}

		return toResponse(b);
	}

	@Transactional(readOnly = true)
	public List<BookingDtos.ConflictSlot> listConflicts(
			String resourceId,
			java.time.LocalDate date,
			SecurityUser principal) {
		// Any authenticated user can view conflict slots to avoid clashes.
		userRepository.findById(principal.getUsername()).orElseThrow();
		return bookingRepository.findByResourceIdAndBookingDate(resourceId, date).stream()
				.filter(this::blocksSlot)
				.map(b -> new BookingDtos.ConflictSlot(b.getStartTime(), b.getEndTime(), b.getStatus()))
				.toList();
	}

	@Transactional
	public void adminDelete(String id, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		bookingRepository.delete(b);
	}

	@Transactional
	public BookingDtos.BookingResponse cancel(String id, SecurityUser principal) {
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (!b.getUserId().equals(u.getId())) {
			throw new ForbiddenException();
		}
		final BookingStatus prevStatus = b.getStatus();
		b.setStatus(BookingStatus.CANCELLED);
		b.setUpdatedAt(Instant.now());
		appendAudit(b, "CANCELLED", prevStatus, BookingStatus.CANCELLED, u, "User cancelled booking");
		b = bookingRepository.save(b);
		var resourceName = resourceRepository.findById(b.getResourceId()).map(r -> r.getName()).orElse("Unknown");
		notificationService.notifyAdmins(
				"BOOKING_CANCELLED",
				"Booking cancelled",
				u.getName() + " cancelled " + resourceName + " on " + b.getBookingDate() + " (" + b.getStartTime() + "–" + b.getEndTime() + ").",
				b.getId());
		return toResponse(b);
	}

	private BookingDtos.BookingResponse toResponse(Booking b) {
		var resource = resourceRepository.findById(b.getResourceId()).orElse(null);
		var user = userRepository.findById(b.getUserId()).orElse(null);
		List<BookingDtos.AuditEvent> audit = (b.getAudit() == null ? List.<BookingAuditEvent>of() : b.getAudit()).stream()
				.map(e -> new BookingDtos.AuditEvent(
						e.getType(),
						e.getFromStatus(),
						e.getToStatus(),
						e.getActorId(),
						e.getActorName(),
						e.getReason(),
						e.getAt()))
				.toList();
		return new BookingDtos.BookingResponse(
				b.getId(),
				b.getResourceId(),
				resource != null ? resource.getName() : "Unknown",
				b.getUserId(),
				user != null ? user.getName() : "Unknown",
				b.getBookingDate().toString(),
				b.getStartTime(),
				b.getEndTime(),
				b.getPurpose(),
				b.getAttendees() != null ? b.getAttendees() : 0,
				b.getStatus(),
				b.getReviewReason(),
				audit,
				b.getCreatedAt(),
				b.getUpdatedAt()
		);
	}

	private void assertCanView(Booking b, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (!b.getUserId().equals(u.getId())) {
			throw new ForbiddenException();
		}
	}

	private boolean overlaps(Booking existing, String startTime, String endTime) {
		return overlaps(existing.getStartTime(), existing.getEndTime(), startTime, endTime);
	}

	private boolean overlaps(String aStart, String aEnd, String bStart, String bEnd) {
		LocalTime as = LocalTime.parse(aStart);
		LocalTime ae = LocalTime.parse(aEnd);
		LocalTime bs = LocalTime.parse(bStart);
		LocalTime be = LocalTime.parse(bEnd);
		return as.isBefore(be) && bs.isBefore(ae);
	}

	private boolean blocksSlot(Booking b) {
		if (b == null || b.getStatus() == null) return false;
		return b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED;
	}

	private void appendAudit(
			Booking b,
			String type,
			BookingStatus from,
			BookingStatus to,
			User actor,
			String reason) {
		if (b.getAudit() == null) {
			b.setAudit(new ArrayList<>());
		}
		b.getAudit().add(BookingAuditEvent.builder()
				.type(type)
				.fromStatus(from)
				.toStatus(to)
				.actorId(actor != null ? actor.getId() : null)
				.actorName(actor != null ? actor.getName() : "SYSTEM")
				.reason(reason)
				.at(Instant.now())
				.build());
	}

	private boolean shouldAutoApprove(Booking b, CampusResource resource) {
		if (!approvalRules.isEnabled()) return false;
		if (b == null || resource == null) return false;
		if (b.getStatus() != BookingStatus.PENDING) return false;

		LocalTime start = parseTime(b.getStartTime());
		LocalTime end = parseTime(b.getEndTime());
		if (start == null || end == null) return false;
		if (!start.isBefore(end)) return false;

		long minutes = Duration.between(start, end).toMinutes();
		if (minutes <= 0 || minutes > approvalRules.getMaxDurationMinutes()) return false;

		if (approvalRules.isEnforceCapacity()
				&& resource.getCapacity() != null
				&& b.getAttendees() != null
				&& b.getAttendees() > resource.getCapacity()) {
			return false;
		}

		if (approvalRules.isRequireWithinAvailability()
				&& resource.getAvailabilityStart() != null
				&& resource.getAvailabilityEnd() != null) {
			LocalTime availStart = parseTime(resource.getAvailabilityStart());
			LocalTime availEnd = parseTime(resource.getAvailabilityEnd());
			if (availStart != null && availEnd != null) {
				// Require booking to fit completely within the availability window.
				if (start.isBefore(availStart) || end.isAfter(availEnd)) return false;
			}
		}

		// If booking date is in the past, do not auto-approve.
		LocalDate bd = b.getBookingDate();
		if (bd != null && bd.isBefore(LocalDate.now())) return false;

		return true;
	}

	private static LocalTime parseTime(String t) {
		if (t == null) return null;
		String s = t.trim();
		if (s.isEmpty()) return null;
		try {
			return LocalTime.parse(s);
		} catch (DateTimeParseException ignored) {
			// Try HH:mm
			try {
				return LocalTime.parse(s.length() >= 5 ? s.substring(0, 5) : s);
			} catch (DateTimeParseException ignored2) {
				return null;
			}
		}
	}
}