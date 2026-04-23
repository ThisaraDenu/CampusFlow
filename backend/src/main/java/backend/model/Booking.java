package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

	@Id
	private String id;

	private String resourceId;

	private String userId;

	private LocalDate bookingDate;

	private String startTime;

	private String endTime;

	private String purpose;

	private Integer attendees;

	private BookingStatus status;

	private String reviewReason;

	private Instant createdAt;

	private Instant updatedAt;

	private List<BookingAuditEvent> audit;
}