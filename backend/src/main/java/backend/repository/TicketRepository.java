package backend.repository;

import backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String> {

	List<Ticket> findByUser_IdOrderByCreatedAtDesc(String userId);

	List<Ticket> findByAssignedTo_IdOrderByCreatedAtDesc(String assignedToId);
}