package backend.controller;

import backend.api.dto.BookingDtos;
import backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.security.SecurityUser;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

	private final BookingService bookingService;

	@GetMapping
	public List<BookingDtos.BookingResponse> list(@AuthenticationPrincipal SecurityUser principal) {
		return bookingService.listFor(principal);
	}

	@GetMapping("/{id}")
	public BookingDtos.BookingResponse get(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		return bookingService.get(id, principal);
	}

	@PostMapping
	public BookingDtos.BookingResponse create(
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody BookingDtos.CreateRequest req) {
		return bookingService.create(principal, req);
	}

	@PatchMapping("/{id}/status")
	public BookingDtos.BookingResponse updateStatus(
			@PathVariable String id,
			@Valid @RequestBody BookingDtos.StatusUpdateRequest req,
			@AuthenticationPrincipal SecurityUser principal) {
		return bookingService.updateStatus(id, req, principal);
	}

	@PostMapping("/{id}/cancel")
	public BookingDtos.BookingResponse cancel(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		return bookingService.cancel(id, principal);
	}
}