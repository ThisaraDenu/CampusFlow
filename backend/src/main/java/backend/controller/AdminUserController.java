package backend.controller;

import backend.api.dto.AdminUserDtos;
import backend.api.dto.UserResponse;
import backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

	private final AdminUserService adminUserService;

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<UserResponse> list() {
		return adminUserService.listAll();
	}

	@PatchMapping("/{id}/role")
	@PreAuthorize("hasRole('ADMIN')")
	public UserResponse updateRole(
			@PathVariable String id,
			@Valid @RequestBody AdminUserDtos.RoleUpdateRequest req) {
		return adminUserService.updateRole(id, req.role());
	}
}