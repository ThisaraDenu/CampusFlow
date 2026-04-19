package backend.service;

import backend.api.dto.BookingDtos;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final BookingRepository bookingRepository;
	private final CampusResourceRepository resourceRepository;
	private final UserRepository userRepository;

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
		return toResponse(bookingRepository.save(b));
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
		b.setStatus(req.status());
		b.setReviewReason(req.reviewReason());
		b.setUpdatedAt(Instant.now());
		return toResponse(bookingRepository.save(b));
	}

	@Transactional
	public BookingDtos.BookingResponse cancel(String id, SecurityUser principal) {
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		if (!b.getUserId().equals(principal.getUsername())) {
			throw new ForbiddenException();
		}
		b.setStatus(BookingStatus.CANCELLED);
		b.setUpdatedAt(Instant.now());
		return toResponse(bookingRepository.save(b));
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
}