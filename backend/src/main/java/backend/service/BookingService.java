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
					.map(BookingDtos.BookingResponse::from)
					.toList();
		}
		return bookingRepository.findByUser_IdOrderByCreatedAtDesc(u.getId()).stream()
				.map(BookingDtos.BookingResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public BookingDtos.BookingResponse get(String id, SecurityUser principal) {
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		assertCanView(b, principal);
		return BookingDtos.BookingResponse.from(b);
	}

	@Transactional
	public BookingDtos.BookingResponse create(SecurityUser principal, BookingDtos.CreateRequest req) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		var resource = resourceRepository.findById(req.resourceId())
				.orElseThrow(() -> new NotFoundException("Resource not found"));
		Instant now = Instant.now();
		Booking b = Booking.builder()
				.id(UUID.randomUUID().toString())
				.resource(resource)
				.user(u)
				.bookingDate(req.bookingDate())
				.startTime(req.startTime())
				.endTime(req.endTime())
				.purpose(req.purpose())
				.attendees(req.attendees())
				.status(BookingStatus.PENDING)
				.createdAt(now)
				.updatedAt(now)
				.build();
		return BookingDtos.BookingResponse.from(bookingRepository.save(b));
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
		return BookingDtos.BookingResponse.from(bookingRepository.save(b));
	}

	@Transactional
	public BookingDtos.BookingResponse cancel(String id, SecurityUser principal) {
		Booking b = bookingRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		if (!b.getUser().getId().equals(principal.getUsername())) {
			throw new ForbiddenException();
		}
		b.setStatus(BookingStatus.CANCELLED);
		b.setUpdatedAt(Instant.now());
		return BookingDtos.BookingResponse.from(bookingRepository.save(b));
	}

	private void assertCanView(Booking b, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (!b.getUser().getId().equals(u.getId())) {
			throw new ForbiddenException();
		}
	}
}