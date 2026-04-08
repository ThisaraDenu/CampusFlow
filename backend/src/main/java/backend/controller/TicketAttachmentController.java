package backend.controller;

import backend.security.SecurityUser;
import backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ticket-attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

	private final TicketService ticketService;

	@GetMapping("/{id}/raw")
	public ResponseEntity<byte[]> downloadRaw(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		var att = ticketService.loadAttachmentForDownload(id, principal);
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, contentDispositionInline(att.getFileName()))
				.contentType(MediaType.parseMediaType(att.getMimeType()))
				.body(att.getContent());
	}

	@DeleteMapping("/{id}")
	public void delete(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		ticketService.deleteAttachment(id, principal);
	}

	private static String contentDispositionInline(String fileName) {
		String safe = fileName != null ? fileName.replace("\"", "") : "file";
		return "inline; filename=\"" + safe + "\"";
	}
}