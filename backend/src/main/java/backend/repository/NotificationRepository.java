package backend.repository;

import backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

	List<Notification> findByUser_IdOrderByCreatedAtDesc(String userId);
}