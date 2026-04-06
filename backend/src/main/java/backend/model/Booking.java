package backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

	@Id
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "resource_id", nullable = false)
	private CampusResource resource;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "booking_date", nullable = false)
	private LocalDate bookingDate;

	@Column(name = "start_time", nullable = false, length = 8)
	private String startTime;

	@Column(name = "end_time", nullable = false, length = 8)
	private String endTime;

	@Column(columnDefinition = "TEXT")
	private String purpose;

	private Integer attendees;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private BookingStatus status;

	@Column(name = "review_reason", columnDefinition = "TEXT")
	private String reviewReason;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
}