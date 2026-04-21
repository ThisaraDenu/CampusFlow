package backend.controller;

import backend.security.SecurityUser;
import backend.service.CloudinaryImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

	private final CloudinaryImageService cloudinaryImageService;

	public record ImageUploadResponse(String publicId, String url) {
	}

	@PostMapping("/image")
	public ImageUploadResponse uploadImage(
			@AuthenticationPrincipal SecurityUser principal,
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "folder", required = false) String folder) {
		String f = (folder == null || folder.isBlank()) ? "campusflow/uploads" : folder.trim();
		var uploaded = cloudinaryImageService.uploadImage(file, f);
		return new ImageUploadResponse(uploaded.publicId(), uploaded.secureUrl());
	}
}

