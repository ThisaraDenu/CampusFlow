package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "ticket_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAttachment {

	@Id
	private String id;

	private String ticketId;

	private String uploadedById;

	private String fileName;

	private String mimeType;

	private byte[] content;

	private Instant createdAt;
}