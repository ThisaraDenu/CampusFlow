package backend.api.dto;

import backend.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminUserDtos {

	public record CreateUserRequest(
			@NotBlank @Size(max = 255) String name,
			@NotBlank @Email @Size(max = 255) String email,
			@NotBlank @Size(min = 6, max = 200) String password,
			@NotNull UserRole role
	) {
	}

	public record RoleUpdateRequest(@NotNull UserRole role) {
	}

	public record ProfileUpdateRequest(
			@NotBlank @Size(max = 255) String name,
			@Email @Size(max = 255) String email
	) {
	}
}