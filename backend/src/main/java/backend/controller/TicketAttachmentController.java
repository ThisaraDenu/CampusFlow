package backend.controller;

import backend.security.SecurityUser;
import backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/ticket-attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

	private final TicketService ticketService;

	@GetMapping("/{id}/raw")
	public ResponseEntity<Void> downloadRaw(
			@PathVariable String id,
			@AuthenticationPrincipal SecurityUser principal) {
		var att = ticketService.loadAttachmentForDownload(id, principal);
		if (att.getUrl() == null || att.getUrl().isBlank()) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.status(HttpStatus.FOUND)
				.location(URI.create(att.getUrl()))
				.header(HttpHeaders.CONTENT_DISPOSITION, contentDispositionInline(att.getFileName()))
				.build();
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