package backend.controller;

import backend.api.dto.UserResponse;
import backend.model.UserRole;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

	private final UserRepository userRepository;

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public List<UserResponse> listTechnicians() {
		return userRepository.findByRole(UserRole.TECHNICIAN).stream()
				.map(UserResponse::from)
				.toList();
	}
}