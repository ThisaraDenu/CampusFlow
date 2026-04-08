package backend.api.dto;

import backend.model.Booking;
import backend.model.BookingStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;

public class BookingDtos {

	public record BookingResponse(
			String id,
			String resourceId,
			String resourceName,
			String userId,
			String userName,
			String date,
			String startTime,
			String endTime,
			String purpose,
			int attendees,
			BookingStatus status,
			String reviewReason,
			Instant createdAt,
			Instant updatedAt
	) {
		public static BookingResponse from(Booking b) {
			return new BookingResponse(
					b.getId(),
					b.getResource().getId(),
					b.getResource().getName(),
					b.getUser().getId(),
					b.getUser().getName(),
					b.getBookingDate().toString(),
					b.getStartTime(),
					b.getEndTime(),
					b.getPurpose(),
					b.getAttendees() != null ? b.getAttendees() : 0,
					b.getStatus(),
					b.getReviewReason(),
					b.getCreatedAt(),
					b.getUpdatedAt());
		}
	}

	public record CreateRequest(
			@NotBlank String resourceId,
			@NotNull @JsonProperty("date") LocalDate bookingDate,
			@NotBlank String startTime,
			@NotBlank String endTime,
			String purpose,
			@NotNull @Min(1) Integer attendees
	) {
	}

	public record StatusUpdateRequest(
			@NotNull BookingStatus status,
			String reviewReason
	) {
	}
}