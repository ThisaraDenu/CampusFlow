package backend.repository;

import backend.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {

	List<TicketComment> findByTicket_IdOrderByCreatedAtAsc(String ticketId);
}