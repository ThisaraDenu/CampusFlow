package backend.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ProfileDtos {

	public record UpdateProfileRequest(
			@NotBlank String name,
			@Email String email
	) {
	}
}

