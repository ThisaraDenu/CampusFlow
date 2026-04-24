package backend.controller;

import backend.api.dto.AdminUserDtos;
import backend.api.dto.UserResponse;
import backend.security.SecurityUser;
import backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

	private final AdminUserService adminUserService;

	@GetMapping
	public List<UserResponse> list() {
		return adminUserService.listAll();
	}

	@PostMapping
	public UserResponse createUser(
			@AuthenticationPrincipal SecurityUser principal,
			@Valid @RequestBody AdminUserDtos.CreateUserRequest req) {
		return adminUserService.createUser(
				principal.getUsername(),
				req.name(),
				req.email(),
				req.password(),
				req.role());
	}

	@PatchMapping("/{id}/role")
	public UserResponse updateRole(
			@AuthenticationPrincipal SecurityUser principal,
			@PathVariable String id,
			@Valid @RequestBody AdminUserDtos.RoleUpdateRequest req) {
		return adminUserService.updateRole(principal.getUsername(), id, req.role());
	}

	@DeleteMapping("/{id}")
	public void deleteUser(
			@AuthenticationPrincipal SecurityUser principal,
			@PathVariable String id) {
		adminUserService.deleteUser(principal.getUsername(), id);
	}

	@PatchMapping("/{id}")
	public UserResponse updateProfile(
			@AuthenticationPrincipal SecurityUser principal,
			@PathVariable String id,
			@Valid @RequestBody AdminUserDtos.ProfileUpdateRequest req) {
		return adminUserService.updateProfile(principal.getUsername(), id, req.name(), req.email());
	}

	@PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public UserResponse uploadAvatar(
			@AuthenticationPrincipal SecurityUser principal,
			@PathVariable String id,
			@RequestPart("file") MultipartFile file) {
		return adminUserService.uploadAvatar(principal.getUsername(), id, file);
	}
}