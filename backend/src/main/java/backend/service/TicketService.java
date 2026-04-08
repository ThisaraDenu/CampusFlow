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

	@Transactional(readOnly = true)
	public List<TicketDtos.TicketResponse> list(String scope, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		String s = scope == null ? "my" : scope.trim().toLowerCase();
		List<Ticket> rows = switch (s) {
			case "assigned" -> ticketRepository.findByAssignedTo_IdOrderByCreatedAtDesc(u.getId());
			case "all" -> {
				if (u.getRole() != UserRole.ADMIN) {
					throw new ForbiddenException();
				}
				yield ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
			}
			default -> ticketRepository.findByUser_IdOrderByCreatedAtDesc(u.getId());
		};
		return rows.stream().map(t -> toResponse(t, false)).toList();
	}

	@Transactional(readOnly = true)
	public TicketDtos.TicketResponse get(String id, SecurityUser principal) {
		Ticket t = ticketRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Ticket not found"));
		assertCanView(t, principal);
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
				.resource(resource)
				.user(u)
				.category(req.category())
				.priority(req.priority())
				.description(req.description())
				.status(TicketStatus.OPEN)
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
				t.setAssignedTo(null);
			} else {
				User assignee = userRepository.findById(aid)
						.orElseThrow(() -> new NotFoundException("Assignee not found"));
				if (assignee.getRole() != UserRole.TECHNICIAN) {
					throw new BadRequestException("Assignee must be a technician");
				}
				t.setAssignedTo(assignee);
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
		return ticketCommentRepository.findByTicket_IdOrderByCreatedAtAsc(ticketId).stream()
				.map(c -> new TicketDtos.CommentResponse(
						c.getId(),
						ticketId,
						c.getUser().getId(),
						c.getUser().getName(),
						c.getUser().getAvatar(),
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
				.ticket(t)
				.user(u)
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
		if (!c.getTicket().getId().equals(ticketId)) {
			throw new NotFoundException("Comment not found");
		}
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (!c.getUser().getId().equals(u.getId()) && u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}
		c.setContent(req.content());
		c = ticketCommentRepository.save(c);
		return new TicketDtos.CommentResponse(
				c.getId(),
				ticketId,
				c.getUser().getId(),
				c.getUser().getName(),
				c.getUser().getAvatar(),
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
		if (!c.getTicket().getId().equals(ticketId)) {
			throw new NotFoundException("Comment not found");
		}
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (!c.getUser().getId().equals(u.getId()) && u.getRole() != UserRole.ADMIN) {
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
		byte[] bytes;
		try {
			bytes = file.getBytes();
		} catch (IOException e) {
			throw new BadRequestException("Could not read file");
		}
		String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
		Instant now = Instant.now();
		TicketAttachment att = TicketAttachment.builder()
				.id(UUID.randomUUID().toString())
				.ticket(t)
				.uploadedBy(u)
				.fileName(original)
				.mimeType(mime)
				.content(bytes)
				.createdAt(now)
				.build();
		att = ticketAttachmentRepository.save(att);
		return new TicketDtos.AttachmentDto(att.getId(), att.getFileName(), att.getMimeType(), att.getCreatedAt());
	}

	@Transactional(readOnly = true)
	public TicketAttachment loadAttachmentForDownload(String attachmentId, SecurityUser principal) {
		TicketAttachment att = ticketAttachmentRepository.findById(attachmentId)
				.orElseThrow(() -> new NotFoundException("Attachment not found"));
		assertCanView(att.getTicket(), principal);
		return att;
	}

	@Transactional
	public void deleteAttachment(String attachmentId, SecurityUser principal) {
		TicketAttachment att = ticketAttachmentRepository.findById(attachmentId)
				.orElseThrow(() -> new NotFoundException("Attachment not found"));
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN
				&& !att.getUploadedBy().getId().equals(u.getId())) {
			throw new ForbiddenException();
		}
		assertCanView(att.getTicket(), principal);
		ticketAttachmentRepository.delete(att);
	}

	private TicketDtos.TicketResponse toResponse(Ticket t, boolean includeAttachments) {
		List<TicketDtos.AttachmentDto> att = List.of();
		if (includeAttachments) {
			att = mapAttachmentMeta(ticketAttachmentRepository.findMetaRowsByTicketId(t.getId()));
		}
		String assignId = t.getAssignedTo() != null ? t.getAssignedTo().getId() : null;
		String assignName = t.getAssignedTo() != null ? t.getAssignedTo().getName() : null;
		return TicketDtos.TicketResponse.from(t, att, assignId, assignName);
	}

	private static List<TicketDtos.AttachmentDto> mapAttachmentMeta(List<Object[]> rows) {
		List<TicketDtos.AttachmentDto> out = new ArrayList<>();
		for (Object[] row : rows) {
			out.add(new TicketDtos.AttachmentDto(
					(String) row[0],
					(String) row[1],
					(String) row[2],
					TicketAttachmentRepository.toInstant(row[3])));
		}
		return out;
	}

	private void assertCanView(Ticket t, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() == UserRole.ADMIN) {
			return;
		}
		if (t.getUser().getId().equals(u.getId())) {
			return;
		}
		if (u.getRole() == UserRole.TECHNICIAN
				&& t.getAssignedTo() != null
				&& t.getAssignedTo().getId().equals(u.getId())) {
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
				&& t.getAssignedTo() != null
				&& t.getAssignedTo().getId().equals(u.getId())) {
			return;
		}
		throw new ForbiddenException();
	}
}