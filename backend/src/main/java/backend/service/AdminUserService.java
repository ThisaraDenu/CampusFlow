package backend.service;

import backend.api.dto.UserResponse;
import backend.exception.BadRequestException;
import backend.exception.ConflictException;
import backend.exception.ForbiddenException;
import backend.exception.NotFoundException;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.UserRepository;
import backend.service.CloudinaryImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

	private final UserRepository userRepository;
	private final CloudinaryImageService cloudinaryImageService;

	@Transactional(readOnly = true)
	public List<UserResponse> listAll() {
		return userRepository.findAll().stream()
				.sorted(Comparator.comparing(u -> u.getCreatedAt() != null ? u.getCreatedAt() : Instant.EPOCH))
				.map(UserResponse::from)
				.toList();
	}

	@Transactional
	public UserResponse updateRole(String actorUserId, String userId, UserRole newRole) {
		User actor = userRepository.findById(actorUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));
		User u = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found"));

		boolean actorIsMain = isMainAdmin(actor);

		// Only main admin can grant/revoke admin role.
		if ((u.getRole() == UserRole.ADMIN || newRole == UserRole.ADMIN) && !actorIsMain) {
			throw new ForbiddenException();
		}
		// Main admin can't be demoted.
		if (isMainAdmin(u) && newRole != UserRole.ADMIN) {
			throw new BadRequestException("Main admin cannot be demoted");
		}

		u.setRole(newRole);
		return UserResponse.from(userRepository.save(u));
	}

	@Transactional
	public void deleteUser(String actorUserId, String targetUserId) {
		User actor = userRepository.findById(actorUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));
		User target = userRepository.findById(targetUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));

		if (actor.getId().equals(target.getId())) {
			throw new BadRequestException("You cannot delete your own account");
		}

		boolean actorIsMain = isMainAdmin(actor);

		if (target.getRole() == UserRole.ADMIN) {
			if (!actorIsMain) {
				throw new ForbiddenException();
			}
			if (isMainAdmin(target)) {
				throw new BadRequestException("Main admin cannot be deleted");
			}
		}

		userRepository.deleteById(target.getId());
	}

	private boolean isMainAdmin(User u) {
		return u.getRole() == UserRole.ADMIN && u.isMainAdmin();
	}

	@Transactional
	public UserResponse updateProfile(String actorUserId, String targetUserId, String name, String email) {
		User actor = userRepository.findById(actorUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));
		User target = userRepository.findById(targetUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));

		assertCanManageProfile(actor, target);

		String newName = name != null ? name.trim() : "";
		if (newName.isBlank()) {
			throw new BadRequestException("Name cannot be blank");
		}
		target.setName(newName);

		if (email != null && !email.isBlank()) {
			String normalizedEmail = email.trim().toLowerCase();
			userRepository.findByEmailIgnoreCase(normalizedEmail)
					.filter(other -> !other.getId().equals(target.getId()))
					.ifPresent(other -> {
						throw new ConflictException("An account with this email already exists");
					});
			target.setEmail(normalizedEmail);
		}

		return UserResponse.from(userRepository.save(target));
	}

	@Transactional
	public UserResponse uploadAvatar(String actorUserId, String targetUserId, MultipartFile file) {
		User actor = userRepository.findById(actorUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));
		User target = userRepository.findById(targetUserId)
				.orElseThrow(() -> new NotFoundException("User not found"));

		assertCanManageProfile(actor, target);

		var uploaded = cloudinaryImageService.uploadImage(file, "campusflow/avatars/" + target.getId());
		target.setAvatar(uploaded.secureUrl());
		return UserResponse.from(userRepository.save(target));
	}

	private void assertCanManageProfile(User actor, User target) {
		if (target.getRole() == UserRole.ADMIN && !isMainAdmin(actor)) {
			throw new ForbiddenException();
		}
	}
}