package backend.controller;

import backend.api.dto.NotificationDtos;
import backend.security.SecurityUser;
import backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationService notificationService;

	@GetMapping
	public List<NotificationDtos.NotificationResponse> list(@AuthenticationPrincipal SecurityUser principal) {
		return notificationService.list(principal);
	}

	@PatchMapping("/{id}/read")
	public NotificationDtos.NotificationResponse markRead(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		return notificationService.markRead(id, principal);
	}

	@PostMapping("/read-all")
	public void markAllRead(@AuthenticationPrincipal SecurityUser principal) {
		notificationService.markAllRead(principal);
	}
}