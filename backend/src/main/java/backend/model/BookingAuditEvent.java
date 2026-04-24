package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingAuditEvent {

	private String type; // CREATED, AUTO_APPROVED, APPROVED, REJECTED, UPDATED, ADMIN_EDIT, CANCELLED

	private BookingStatus fromStatus;

	private BookingStatus toStatus;

	private String actorId; // user id or null for SYSTEM

	private String actorName;

	private String reason;

	private Instant at;
}

