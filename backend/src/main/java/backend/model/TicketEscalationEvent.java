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
public class TicketEscalationEvent {

	private String note;

	private String actorId; // user id or null for SYSTEM

	private String actorName;

	private String previousAssigneeId;

	private String newAssigneeId;

	private Instant at;
}

