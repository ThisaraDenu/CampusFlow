package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

	@Id
	private String id;

	private String resourceId;

	private String userId;

	private TicketCategory category;

	private TicketPriority priority;

	private String description;

	private TicketStatus status;

	private String assignedToId;

	/**
	 * When a technician is assigned, the ticket stays OPEN but the reporter should not see it as "OPEN"
	 * until the assigned technician actually opens the ticket details.
	 */
	private boolean technicianViewed;

	private String resolutionNotes;

	/**
	 * SLA due time based on priority (computed at creation).
	 */
	private Instant slaDueAt;

	/**
	 * Marks whether an overdue notification/escalation was already sent.
	 */
	private boolean slaOverdueNotified;

	private List<TicketEscalationEvent> escalations;

	private Instant createdAt;

	private Instant updatedAt;
}