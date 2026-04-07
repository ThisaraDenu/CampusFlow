package backend.service;

import backend.api.dto.UserResponse;
import backend.exception.NotFoundException;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

	private final UserRepository userRepository;

	@Transactional(readOnly = true)
	public List<UserResponse> listAll() {
		return userRepository.findAll().stream()
				.sorted(Comparator.comparing(User::getCreatedAt))
				.map(UserResponse::from)
				.toList();
	}

	@Transactional
	public UserResponse updateRole(String userId, UserRole newRole) {
		User u = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found"));
		u.setRole(newRole);
		return UserResponse.from(userRepository.save(u));
	}
}