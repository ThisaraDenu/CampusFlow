package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

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

	private String resolutionNotes;

	private Instant createdAt;

	private Instant updatedAt;
}