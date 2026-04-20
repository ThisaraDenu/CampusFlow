package backend.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

	public record LoginRequest(
			@NotBlank @Email String email,
			@NotBlank String password
	) {
	}

	public record RegisterRequest(
			@NotBlank @Size(max = 255) String name,
			@NotBlank @Email String email,
			@NotBlank @Size(min = 6, max = 100) String password
	) {
	}

	public record TokenResponse(String token, UserResponse user) {
	}
}
