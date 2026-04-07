package backend.api.dto;

import backend.model.UserRole;
import jakarta.validation.constraints.NotNull;

public class AdminUserDtos {

	public record RoleUpdateRequest(@NotNull UserRole role) {
	}
}