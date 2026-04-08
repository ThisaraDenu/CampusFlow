package backend.api.dto;

import backend.model.User;
import backend.model.UserRole;

import java.time.Instant;

public record UserResponse(
		String id,
		String name,
		String email,
		UserRole role,
		String avatar,
		Instant createdAt
) {
	public static UserResponse from(User u) {
		return new UserResponse(
				u.getId(),
				u.getName(),
				u.getEmail(),
				u.getRole(),
				u.getAvatar(),
				u.getCreatedAt());
	}
}