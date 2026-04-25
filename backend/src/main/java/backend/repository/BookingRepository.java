package backend.repository;

import backend.model.Booking;
import backend.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

	List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

	List<Booking> findByResourceIdAndBookingDate(String resourceId, LocalDate bookingDate);

	List<Booking> findByStatus(BookingStatus status);
}