package backend.service;

import backend.api.dto.NotificationDtos;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.Notification;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	@Transactional
	public Notification create(
			String userId,
			String type,
			String title,
			String message,
			String relatedId) {
		Notification n = Notification.builder()
				.id(UUID.randomUUID().toString())
				.userId(userId)
				.type(type)
				.title(title)
				.message(message)
				.readFlag(false)
				.relatedId(relatedId)
				.createdAt(Instant.now())
				.build();
		return notificationRepository.save(n);
	}

	@Transactional
	public void notifyAdmins(String type, String title, String message, String relatedId) {
		List<User> admins = userRepository.findByRole(UserRole.ADMIN);
		for (User a : admins) {
			create(a.getId(), type, title, message, relatedId);
		}
	}

	@Transactional(readOnly = true)
	public List<NotificationDtos.NotificationResponse> list(SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(u.getId()).stream()
				.map(NotificationDtos.NotificationResponse::from)
				.toList();
	}

	@Transactional
	public NotificationDtos.NotificationResponse markRead(String id, SecurityUser principal) {
		Notification n = notificationRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Notification not found"));
		if (!n.getUserId().equals(principal.getUsername())) {
			throw new ForbiddenException();
		}
		n.setReadFlag(true);
		return NotificationDtos.NotificationResponse.from(notificationRepository.save(n));
	}

	@Transactional
	public void markAllRead(SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		List<Notification> rows = notificationRepository.findByUserIdOrderByCreatedAtDesc(u.getId());
		for (Notification n : rows) {
			if (!n.isReadFlag()) {
				n.setReadFlag(true);
			}
		}
		notificationRepository.saveAll(rows);
	}
}