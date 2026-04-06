package backend.repository;

import backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {

	List<Booking> findByUser_IdOrderByCreatedAtDesc(String userId);
}