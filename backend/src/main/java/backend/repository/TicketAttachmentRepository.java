package backend.repository;

import backend.model.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

	List<TicketAttachment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

	void deleteByTicketId(String ticketId);

	interface AttachmentMeta {
		String getId();
		String getFileName();
		String getMimeType();
		String getUrl();
		Instant getCreatedAt();
	}

	@Query(value = "{ 'ticketId': ?0 }")
	List<AttachmentMeta> findMetaByTicketIdOrderByCreatedAtAsc(String ticketId);

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