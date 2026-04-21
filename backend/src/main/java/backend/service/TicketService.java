package backend.service;

import backend.api.dto.TicketDtos;
import backend.exception.BadRequestException;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.Ticket;
import backend.model.TicketAttachment;
import backend.model.TicketComment;
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
		Ticket t = Ticket.builder()
				.id(UUID.randomUUID().toString())
				.resourceId(resource.getId())
				.userId(u.getId())
				.category(req.category())
				.priority(req.priority())
				.description(req.description())
				.status(TicketStatus.OPEN)
				.technicianViewed(false)
				.createdAt(now)
				.updatedAt(now)
				.build();
		return toResponse(ticketRepository.save(t), true);
	}

	@Transactional
	public TicketDtos.TicketResponse update(String id, SecurityUser principal, TicketDtos.UpdateRequest req) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanUpdate(t, principal);
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
		return toResponse(ticketRepository.save(t), true);
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