package backend.repository;

import backend.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, String> {

	List<TicketAttachment> findByTicket_IdOrderByCreatedAtAsc(String ticketId);

	@Query(value = """
			SELECT id, file_name, mime_type, created_at
			FROM ticket_attachments
			WHERE ticket_id = :ticketId
			ORDER BY created_at ASC
			""", nativeQuery = true)
	List<Object[]> findMetaRowsByTicketId(@Param("ticketId") String ticketId);

	static Instant toInstant(Object o) {
		if (o == null) {
			return null;
		}
		if (o instanceof Instant i) {
			return i;
		}
		if (o instanceof java.sql.Timestamp ts) {
			return ts.toInstant();
		}
		throw new IllegalStateException("Unexpected timestamp type: " + o.getClass());
	}
}