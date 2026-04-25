package backend.repository;

import backend.model.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

	List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

	void deleteByTicketId(String ticketId);
}