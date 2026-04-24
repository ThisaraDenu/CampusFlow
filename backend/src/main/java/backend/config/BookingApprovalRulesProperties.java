package backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.booking.auto-approve")
public class BookingApprovalRulesProperties {

	/**
	 * Enable auto-approving bookings that satisfy rules.
	 */
	private boolean enabled = true;

	/**
	 * Maximum booking duration for auto-approval.
	 */
	private int maxDurationMinutes = 180;

	/**
	 * If true, attendees must be <= resource capacity.
	 */
	private boolean enforceCapacity = true;

	/**
	 * If true, booking time must fall within resource availabilityStart/End (if configured).
	 */
	private boolean requireWithinAvailability = true;
}

