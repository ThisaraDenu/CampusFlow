package backend.api.dto;

import backend.model.Booking;
import backend.model.BookingStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class BookingDtos {

	public record AuditEvent(
			String type,
			BookingStatus fromStatus,
			BookingStatus toStatus,
			String actorId,
			String actorName,
			String reason,
			Instant at
	) {
	}

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
			List<AuditEvent> audit,
			Instant createdAt,
			Instant updatedAt
	) {
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

	public record UpdateRequest(
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

	public record ConflictSlot(
			String startTime,
			String endTime,
			BookingStatus status
	) {
	}
}