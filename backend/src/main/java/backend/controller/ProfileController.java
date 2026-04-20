package backend.controller;

import backend.api.dto.ProfileDtos;
import backend.api.dto.UserResponse;
import backend.exception.ConflictException;
import backend.model.User;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import backend.service.CloudinaryImageService;
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

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

	private final UserRepository userRepository;
	private final CloudinaryImageService cloudinaryImageService;

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
		var uploaded = cloudinaryImageService.uploadImage(file, "campusflow/avatars");

		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		u.setAvatar(uploaded.secureUrl());
		return UserResponse.from(userRepository.save(u));
	}
}

