package backend.repository;

import backend.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

	List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);

	List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String assignedToId);
}