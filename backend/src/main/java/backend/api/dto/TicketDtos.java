package backend.api.dto;

import backend.model.Ticket;
import backend.model.TicketCategory;
import backend.model.TicketPriority;
import backend.model.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public class TicketDtos {

	public record AttachmentDto(
			String id,
			String fileName,
			String mimeType,
			String url,
			Instant createdAt
	) {
	}

	public record TicketResponse(
			String id,
			String resourceId,
			String resourceName,
			String userId,
			String userName,
			TicketCategory category,
			TicketPriority priority,
			String description,
			TicketStatus status,
			String assignedTo,
			String assignedToName,
			String resolutionNotes,
			List<AttachmentDto> attachments,
			Instant createdAt,
			Instant updatedAt
	) {
		public static TicketResponse from(
				Ticket t,
				String resourceName,
				String userName,
				List<AttachmentDto> attachments,
				String assignedToId,
				String assignedToName) {
			return new TicketResponse(
					t.getId(),
					t.getResourceId(),
					resourceName,
					t.getUserId(),
					userName,
					t.getCategory(),
					t.getPriority(),
					t.getDescription(),
					t.getStatus(),
					assignedToId,
					assignedToName,
					t.getResolutionNotes(),
					attachments,
					t.getCreatedAt(),
					t.getUpdatedAt());
		}
	}

	public record CreateRequest(
			@NotBlank String resourceId,
			@NotNull TicketCategory category,
			@NotNull TicketPriority priority,
			@NotBlank String description
	) {
	}

	public record UpdateRequest(
			@NotNull TicketStatus status,
			String resolutionNotes,
			String assignedTo
	) {
	}

	public record CommentResponse(
			String id,
			String ticketId,
			String userId,
			String userName,
			String userAvatar,
			String content,
			Instant createdAt
	) {
	}

	public record CommentCreateRequest(@NotBlank String content) {
	}

	public record CommentUpdateRequest(@NotBlank String content) {
	}
}