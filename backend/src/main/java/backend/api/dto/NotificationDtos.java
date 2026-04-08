package backend.api.dto;

import backend.model.Notification;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class NotificationDtos {

	public record NotificationResponse(
			String id,
			String userId,
			String type,
			String title,
			String message,
			@JsonProperty("isRead") boolean read,
			String relatedId,
			Instant createdAt
	) {
		public static NotificationResponse from(Notification n) {
			return new NotificationResponse(
					n.getId(),
					n.getUser().getId(),
					n.getType(),
					n.getTitle(),
					n.getMessage(),
					n.isReadFlag(),
					n.getRelatedId(),
					n.getCreatedAt());
		}
	}
}