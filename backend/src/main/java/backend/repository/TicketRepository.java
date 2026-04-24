package backend.repository;

import backend.model.Ticket;
import backend.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

	List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);

	List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String assignedToId);

	List<Ticket> findByStatusInAndSlaDueAtBeforeAndSlaOverdueNotifiedFalse(List<TicketStatus> statuses, Instant before);
}