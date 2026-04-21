package backend.service;

import backend.api.dto.BookingDtos;
import backend.exception.ConflictException;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.Booking;
import backend.model.BookingStatus;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.BookingRepository;
import backend.repository.CampusResourceRepository;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final BookingRepository bookingRepository;
	private final CampusResourceRepository resourceRepository;
	private final UserRepository userRepository;
	private final NotificationService notificationService;

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
				.build();
		b = bookingRepository.save(b);

		notificationService.create(
				u.getId(),
				"BOOKING_CREATED",
				"Booking request submitted",
				"Your booking request for " + resource.getName() + " on " + b.getBookingDate()
						+ " (" + b.getStartTime() + "–" + b.getEndTime() + ") was submitted.",
				b.getId());

		notificationService.notifyAdmins(
				"BOOKING_CREATED",
				"New booking request",
				u.getName() + " requested " + resource.getName() + " on " + b.getBookingDate()
						+ " (" + b.getStartTime() + "–" + b.getEndTime() + ").",
				b.getId());

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
		b.setStatus(BookingStatus.CANCELLED);
		b.setUpdatedAt(Instant.now());
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
}