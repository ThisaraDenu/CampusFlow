package backend.service;

import backend.api.dto.TicketDtos;
import backend.exception.BadRequestException;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.Ticket;
import backend.model.TicketAttachment;
import backend.model.TicketComment;
import backend.model.TicketEscalationEvent;
import backend.model.TicketPriority;
import backend.model.TicketStatus;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.CampusResourceRepository;
import backend.repository.TicketAttachmentRepository;
import backend.repository.TicketCommentRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

	private final TicketRepository ticketRepository;
	private final TicketCommentRepository ticketCommentRepository;
	private final TicketAttachmentRepository ticketAttachmentRepository;
	private final CampusResourceRepository resourceRepository;
	private final UserRepository userRepository;
	private final CloudinaryImageService cloudinaryImageService;
	private final NotificationService notificationService;

	@Transactional(readOnly = true)
	public List<TicketDtos.TicketResponse> list(String scope, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		String s = scope == null ? "my" : scope.trim().toLowerCase();
		List<Ticket> rows = switch (s) {
			case "assigned" -> ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(u.getId());
			case "all" -> {
				if (u.getRole() != UserRole.ADMIN) {
					throw new ForbiddenException();
				}
				yield ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
			}
			default -> ticketRepository.findByUserIdOrderByCreatedAtDesc(u.getId());
		};
		return rows.stream().map(t -> toResponse(t, false)).toList();
	}

	@Transactional
	public TicketDtos.TicketResponse get(String id, SecurityUser principal) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		// Mark as viewed when the assigned technician opens the ticket.
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedToId() != null
				&& t.getAssignedToId().equals(u.getId())
				&& !t.isTechnicianViewed()) {
			t.setTechnicianViewed(true);
			t.setUpdatedAt(Instant.now());
			t = ticketRepository.save(t);
		}
		return toResponse(t, true);
	}

	@Transactional
	public TicketDtos.TicketResponse create(SecurityUser principal, TicketDtos.CreateRequest req) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		var resource = resourceRepository.findById(req.resourceId())
				.orElseThrow(() -> new NotFoundException("Resource not found"));
		Instant now = Instant.now();
		Instant dueAt = now.plus(slaDurationFor(req.priority()));
		Ticket t = Ticket.builder()
				.id(UUID.randomUUID().toString())
				.resourceId(resource.getId())
				.userId(u.getId())
				.category(req.category())
				.priority(req.priority())
				.description(req.description())
				.status(TicketStatus.OPEN)
				.technicianViewed(false)
				.slaDueAt(dueAt)
				.slaOverdueNotified(false)
				.escalations(new ArrayList<>())
				.createdAt(now)
				.updatedAt(now)
				.build();
		t = ticketRepository.save(t);

		notificationService.create(
				u.getId(),
				"TICKET_CREATED",
				"Ticket submitted",
				"Your ticket #" + t.getId() + " (" + resource.getName() + ") was submitted successfully.",
				t.getId());

		return toResponse(t, true);
	}

	@Transactional
	public TicketDtos.TicketResponse escalate(String id, SecurityUser principal, TicketDtos.EscalateRequest req) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		User actor = userRepository.findById(principal.getUsername()).orElseThrow();
		boolean isAdmin = actor.getRole() == UserRole.ADMIN;
		boolean isAssignedTech = actor.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedToId() != null
				&& t.getAssignedToId().equals(actor.getId());
		if (!isAdmin && !isAssignedTech) {
			throw new ForbiddenException();
		}
		if (t.getStatus() == TicketStatus.RESOLVED
				|| t.getStatus() == TicketStatus.CLOSED
				|| t.getStatus() == TicketStatus.REJECTED) {
			throw new BadRequestException("Cannot escalate a completed ticket");
		}

		String prevAssignee = t.getAssignedToId();
		String newAssignee = prevAssignee;
		String note = req != null && req.note() != null ? req.note().trim() : "";

		if (isAdmin && req != null && req.reassignTo() != null) {
			String aid = req.reassignTo().isBlank() ? null : req.reassignTo();
			if (aid == null) {
				newAssignee = null;
				t.setAssignedToId(null);
			} else {
				User assignee = userRepository.findById(aid)
						.orElseThrow(() -> new NotFoundException("Assignee not found"));
				if (assignee.getRole() != UserRole.TECHNICIAN) {
					throw new BadRequestException("Assignee must be a technician");
				}
				newAssignee = assignee.getId();
				t.setAssignedToId(newAssignee);
			}
		}

		if (t.getEscalations() == null) {
			t.setEscalations(new ArrayList<>());
		}
		t.getEscalations().add(TicketEscalationEvent.builder()
				.note(note.isBlank() ? null : note)
				.actorId(actor.getId())
				.actorName(actor.getName())
				.previousAssigneeId(prevAssignee)
				.newAssigneeId(newAssignee)
				.at(Instant.now())
				.build());
		t.setUpdatedAt(Instant.now());

		// If escalating, clear overdue-notified so scheduler can re-notify if needed after reassignment.
		t.setSlaOverdueNotified(true);

		t = ticketRepository.save(t);

		final String resourceName = resourceRepository.findById(t.getResourceId()).map(r -> r.getName()).orElse("Unknown");
		final String msg = note.isBlank()
				? "Ticket #" + t.getId() + " (" + resourceName + ") was escalated by " + actor.getName() + "."
				: "Ticket #" + t.getId() + " (" + resourceName + ") was escalated by " + actor.getName() + ". Note: " + note;

		notificationService.notifyAdmins(
				"TICKET_ESCALATED",
				"Ticket escalated",
				msg,
				t.getId());

		if (t.getAssignedToId() != null && !t.getAssignedToId().equals(actor.getId())) {
			notificationService.create(
					t.getAssignedToId(),
					"TICKET_ESCALATED_TECH",
					"Ticket escalated",
					msg,
					t.getId());
		}

		return toResponse(t, true);
	}

	@Transactional
	public void notifyOverdueTickets() {
		Instant now = Instant.now();
		List<Ticket> due = ticketRepository.findByStatusInAndSlaDueAtBeforeAndSlaOverdueNotifiedFalse(
				List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
				now);
		for (Ticket t : due) {
			t.setSlaOverdueNotified(true);
			t.setUpdatedAt(now);
			ticketRepository.save(t);

			final String resourceName = resourceRepository.findById(t.getResourceId()).map(r -> r.getName()).orElse("Unknown");
			String msg = "Ticket #" + t.getId() + " (" + resourceName + ") is overdue. Priority: " + t.getPriority() + ".";

			notificationService.notifyAdmins(
					"TICKET_OVERDUE",
					"Ticket overdue",
					msg,
					t.getId());

			if (t.getAssignedToId() != null) {
				notificationService.create(
						t.getAssignedToId(),
						"TICKET_OVERDUE_TECH",
						"Ticket overdue",
						msg,
						t.getId());
			}
		}
	}

	private static Duration slaDurationFor(TicketPriority p) {
		if (p == null) return Duration.ofHours(24);
		return switch (p) {
			case CRITICAL -> Duration.ofHours(4);
			case HIGH -> Duration.ofHours(8);
			case MEDIUM -> Duration.ofHours(24);
			case LOW -> Duration.ofHours(72);
		};
	}

	@Transactional
	public TicketDtos.TicketResponse update(String id, SecurityUser principal, TicketDtos.UpdateRequest req) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanUpdate(t, principal);

		final TicketStatus prevStatus = t.getStatus();
		final String prevAssignedToId = t.getAssignedToId();

		t.setStatus(req.status());
		if (req.resolutionNotes() != null) {
			t.setResolutionNotes(req.resolutionNotes());
		}
		if (req.assignedTo() != null) {
			String aid = req.assignedTo().isBlank() ? null : req.assignedTo();
			if (aid == null) {
				t.setAssignedToId(null);
			} else {
				User assignee = userRepository.findById(aid)
						.orElseThrow(() -> new NotFoundException("Assignee not found"));
				if (assignee.getRole() != UserRole.TECHNICIAN) {
					throw new BadRequestException("Assignee must be a technician");
				}
				t.setAssignedToId(assignee.getId());
			}
		}
		t.setUpdatedAt(Instant.now());
		t = ticketRepository.save(t);

		final String resourceName = resourceRepository.findById(t.getResourceId()).map(r -> r.getName()).orElse("Unknown");
		final String newAssignedToId = t.getAssignedToId();
		final TicketStatus newStatus = t.getStatus();

		if (newAssignedToId != null && !newAssignedToId.equals(prevAssignedToId)) {
			final String techName = userRepository.findById(newAssignedToId).map(User::getName).orElse("Unknown");
			notificationService.create(
					t.getUserId(),
					"TICKET_ASSIGNED",
					"Technician assigned",
					"Your ticket #" + t.getId() + " (" + resourceName + ") was assigned to " + techName + ".",
					t.getId());

			notificationService.create(
					newAssignedToId,
					"TICKET_ASSIGNED_TECH",
					"New ticket assigned",
					"Ticket #" + t.getId() + " assigned: " + resourceName + " • Priority: " + t.getPriority() + ".",
					t.getId());
		}

		if (newStatus != null && newStatus != prevStatus) {
			if (newStatus == TicketStatus.REJECTED) {
				final String techName = newAssignedToId != null
						? userRepository.findById(newAssignedToId).map(User::getName).orElse("Unknown")
						: "Unknown";
				final String reason = t.getResolutionNotes();
				final String adminMsg = (reason == null || reason.isBlank())
						? "Ticket #" + t.getId() + " (" + resourceName + ") was rejected by " + techName + "."
						: "Ticket #" + t.getId() + " (" + resourceName + ") was rejected by " + techName + ". Reason: " + reason;
				notificationService.notifyAdmins(
						"TICKET_REJECTED",
						"Ticket rejected by technician",
						adminMsg,
						t.getId());

				final String userMsg = (reason == null || reason.isBlank())
						? "Your ticket #" + t.getId() + " was rejected."
						: "Your ticket #" + t.getId() + " was rejected. Reason: " + reason;
				notificationService.create(
						t.getUserId(),
						"TICKET_REJECTED",
						"Ticket rejected",
						userMsg,
						t.getId());
			} else {
				notificationService.create(
						t.getUserId(),
						"TICKET_STATUS_CHANGED",
						"Ticket status updated",
						"Ticket #" + t.getId() + " is now " + newStatus + ".",
						t.getId());
			}
		}

		return toResponse(t, true);
	}

	@Transactional(readOnly = true)
	public List<TicketDtos.CommentResponse> listComments(String ticketId, SecurityUser principal) {
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
				.map(c -> new TicketDtos.CommentResponse(
						c.getId(),
						ticketId,
						c.getUserId(),
						userRepository.findById(c.getUserId()).map(User::getName).orElse("Unknown"),
						userRepository.findById(c.getUserId()).map(User::getAvatar).orElse(null),
						c.getContent(),
						c.getCreatedAt()))
				.toList();
	}

	@Transactional
	public TicketDtos.CommentResponse addComment(String ticketId, SecurityUser principal, TicketDtos.CommentCreateRequest req) {
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		Instant now = Instant.now();
		TicketComment c = TicketComment.builder()
				.id(UUID.randomUUID().toString())
				.ticketId(t.getId())
				.userId(u.getId())
				.content(req.content())
				.createdAt(now)
				.build();
		c = ticketCommentRepository.save(c);
		return new TicketDtos.CommentResponse(
				c.getId(),
				ticketId,
				u.getId(),
				u.getName(),
				u.getAvatar(),
				c.getContent(),
				c.getCreatedAt());
	}

	@Transactional
	public TicketDtos.CommentResponse updateComment(
			String ticketId,
			String commentId,
			SecurityUser principal,
			TicketDtos.CommentUpdateRequest req) {
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		TicketComment c = ticketCommentRepository.findById(commentId)
				.orElseThrow(() -> new NotFoundException("Comment not found"));
		if (!c.getTicketId().equals(ticketId)) {
			throw new NotFoundException("Comment not found");
		}
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (!c.getUserId().equals(u.getId()) && u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		c.setContent(req.content());
		c = ticketCommentRepository.save(c);
		User commentUser = userRepository.findById(c.getUserId()).orElse(null);
		return new TicketDtos.CommentResponse(
				c.getId(),
				ticketId,
				c.getUserId(),
				commentUser != null ? commentUser.getName() : "Unknown",
				commentUser != null ? commentUser.getAvatar() : null,
				c.getContent(),
				c.getCreatedAt());
	}

	@Transactional
	public void deleteComment(String ticketId, String commentId, SecurityUser principal) {
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		TicketComment c = ticketCommentRepository.findById(commentId)
				.orElseThrow(() -> new NotFoundException("Comment not found"));
		if (!c.getTicketId().equals(ticketId)) {
			throw new NotFoundException("Comment not found");
		}
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (!c.getUserId().equals(u.getId()) && u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		ticketCommentRepository.delete(c);
	}

	@Transactional
	public TicketDtos.AttachmentDto uploadAttachment(String ticketId, SecurityUser principal, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("File required");
		}
		Ticket t = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		String mime = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
		String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
		Instant now = Instant.now();
		var uploaded = cloudinaryImageService.uploadFile(file, "campusflow/tickets/" + ticketId);
		TicketAttachment att = TicketAttachment.builder()
				.id(UUID.randomUUID().toString())
				.ticketId(t.getId())
				.uploadedById(u.getId())
				.fileName(original)
				.mimeType(mime)
				.publicId(uploaded.publicId())
				.url(uploaded.secureUrl())
				.createdAt(now)
				.build();
		att = ticketAttachmentRepository.save(att);
		return new TicketDtos.AttachmentDto(att.getId(), att.getFileName(), att.getMimeType(), att.getUrl(), att.getCreatedAt());
	}

	@Transactional(readOnly = true)
	public TicketAttachment loadAttachmentForDownload(String attachmentId, SecurityUser principal) {
		TicketAttachment att = ticketAttachmentRepository.findById(attachmentId)
				.orElseThrow(() -> new NotFoundException("Attachment not found"));
		Ticket t = ticketRepository.findById(att.getTicketId())
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		return att;
	}

	@Transactional
	public void deleteAttachment(String attachmentId, SecurityUser principal) {
		TicketAttachment att = ticketAttachmentRepository.findById(attachmentId)
				.orElseThrow(() -> new NotFoundException("Attachment not found"));
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN
				&& !att.getUploadedById().equals(u.getId())) {
			throw new ForbiddenException();
		}
		Ticket t = ticketRepository.findById(att.getTicketId())
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
		String mime = att.getMimeType() != null ? att.getMimeType() : "";
		String rt = mime.toLowerCase().startsWith("image/") ? "image" : "raw";
		cloudinaryImageService.deleteByPublicId(att.getPublicId(), rt);
		ticketAttachmentRepository.delete(att);
	}

	@Transactional
	public void adminDelete(String id, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));

		// Delete attachments from Cloudinary (and DB), then comments, then the ticket itself.
		List<TicketAttachment> atts = ticketAttachmentRepository.findByTicketIdOrderByCreatedAtAsc(t.getId());
		for (TicketAttachment att : atts) {
			String mime = att.getMimeType() != null ? att.getMimeType() : "";
			String rt = mime.toLowerCase().startsWith("image/") ? "image" : "raw";
			cloudinaryImageService.deleteByPublicId(att.getPublicId(), rt);
		}
		ticketAttachmentRepository.deleteByTicketId(t.getId());
		ticketCommentRepository.deleteByTicketId(t.getId());
		ticketRepository.delete(t);
	}

	private TicketDtos.TicketResponse toResponse(Ticket t, boolean includeAttachments) {
		List<TicketDtos.AttachmentDto> att = List.of();
		if (includeAttachments) {
			att = ticketAttachmentRepository.findMetaByTicketIdOrderByCreatedAtAsc(t.getId()).stream()
					.map(m -> new TicketDtos.AttachmentDto(m.getId(), m.getFileName(), m.getMimeType(), m.getUrl(), m.getCreatedAt()))
					.toList();
		}
		var resourceName = resourceRepository.findById(t.getResourceId()).map(r -> r.getName()).orElse("Unknown");
		var userName = userRepository.findById(t.getUserId()).map(User::getName).orElse("Unknown");
		String assignId = t.getAssignedToId();
		String assignName = assignId != null
				? userRepository.findById(assignId).map(User::getName).orElse(null)
				: null;
		return TicketDtos.TicketResponse.from(t, resourceName, userName, att, assignId, assignName);
	}

	private void assertCanView(Ticket t, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (t.getUserId().equals(u.getId())) {
			return;
		}
		if (u.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedToId() != null
				&& t.getAssignedToId().equals(u.getId())) {
			return;
		}
		throw new ForbiddenException();
	}

	private void assertCanUpdate(Ticket t, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (u.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedToId() != null
				&& t.getAssignedToId().equals(u.getId())) {
			return;
		}
		throw new ForbiddenException();
	}
}