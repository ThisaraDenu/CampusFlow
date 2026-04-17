package backend.controller;

import backend.api.dto.ProfileDtos;
import backend.api.dto.UserResponse;
import backend.exception.ConflictException;
import backend.model.User;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

	private final UserRepository userRepository;

	@PatchMapping
	public UserResponse update(
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody ProfileDtos.UpdateProfileRequest req) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();

		String newName = req.name() != null ? req.name().trim() : "";
		if (newName.isBlank()) {
			throw new IllegalArgumentException("Name cannot be blank");
		}
		u.setName(newName);

		if (req.email() != null && !req.email().isBlank()) {
			String normalizedEmail = req.email().trim().toLowerCase();
			userRepository.findByEmailIgnoreCase(normalizedEmail)
					.filter(other -> !other.getId().equals(u.getId()))
					.ifPresent(other -> {
						throw new ConflictException("An account with this email already exists");
					});
			u.setEmail(normalizedEmail);
		}

		return UserResponse.from(userRepository.save(u));
	}

	// Do NOT force consumes=multipart; if the client sends a wrong content-type we prefer a clean 400
	// over "No static resource ..." which is confusing to debug.
	@PostMapping(value = "/avatar")
	public UserResponse uploadAvatar(
			@AuthenticationPrincipal SecurityUser principal,
			@RequestParam("file") MultipartFile file) throws Exception {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Missing file");
		}
		String contentType = file.getContentType();
		if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
			throw new IllegalArgumentException("Only image uploads are allowed");
		}
		// Keep avatars small to avoid bloating DB row (stored as data URL in users.avatar).
		long maxBytes = 2L * 1024 * 1024;
		if (file.getSize() > maxBytes) {
			throw new IllegalArgumentException("Image too large (max 2MB)");
		}

		byte[] bytes = file.getBytes();
		String base64 = Base64.getEncoder().encodeToString(bytes);
		String dataUrl = "data:" + contentType + ";base64," + base64;

		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		u.setAvatar(dataUrl);
		return UserResponse.from(userRepository.save(u));
	}
}

