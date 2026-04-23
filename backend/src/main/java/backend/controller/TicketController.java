package backend.controller;

import backend.api.dto.TicketDtos;
import backend.security.SecurityUser;
import backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

	private final TicketService ticketService;

	@GetMapping
	public List<TicketDtos.TicketResponse> list(
			@RequestParam(defaultValue = "my") String scope,
			@AuthenticationPrincipal SecurityUser principal) {
		return ticketService.list(scope, principal);
	}

	@GetMapping("/{id}")
	public TicketDtos.TicketResponse get(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		return ticketService.get(id, principal);
	}

	@PostMapping
	public TicketDtos.TicketResponse create(
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody TicketDtos.CreateRequest req) {
		return ticketService.create(principal, req);
	}

	@PatchMapping("/{id}")
	public TicketDtos.TicketResponse update(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody TicketDtos.UpdateRequest req) {
		return ticketService.update(id, principal, req);
	}

	@DeleteMapping("/{id}")
	public void adminDelete(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		ticketService.adminDelete(id, principal);
	}

	@GetMapping("/{ticketId}/comments")
	public List<TicketDtos.CommentResponse> listComments(
			@PathVariable String ticketId,
			@AuthenticationPrincipal SecurityUser principal) {
		return ticketService.listComments(ticketId, principal);
	}

	@PostMapping("/{ticketId}/comments")
	public TicketDtos.CommentResponse addComment(
			@PathVariable String ticketId,
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody TicketDtos.CommentCreateRequest req) {
		return ticketService.addComment(ticketId, principal, req);
	}

	@PatchMapping("/{ticketId}/comments/{commentId}")
	public TicketDtos.CommentResponse updateComment(
			@PathVariable String ticketId,
			@PathVariable String commentId,
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody TicketDtos.CommentUpdateRequest req) {
		return ticketService.updateComment(ticketId, commentId, principal, req);
	}

	@DeleteMapping("/{ticketId}/comments/{commentId}")
	public void deleteComment(
			@PathVariable String ticketId,
			@PathVariable String commentId,
			@AuthenticationPrincipal SecurityUser principal) {
		ticketService.deleteComment(ticketId, commentId, principal);
	}

	@PostMapping(value = "/{ticketId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public TicketDtos.AttachmentDto uploadAttachment(
			@PathVariable String ticketId,
			@AuthenticationPrincipal SecurityUser principal,
			@RequestPart("file") MultipartFile file) {
		return ticketService.uploadAttachment(ticketId, principal, file);
	}
}