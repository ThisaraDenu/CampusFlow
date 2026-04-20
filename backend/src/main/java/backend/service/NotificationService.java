package backend.service;

import backend.api.dto.NotificationDtos;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.Notification;
import backend.model.User;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

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