package backend.controller;

import backend.api.dto.AuthDtos;
import backend.api.dto.UserResponse;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import backend.security.JwtService;
import backend.service.AuthService;
import backend.service.UserAccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final UserAccountService userAccountService;
	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository;

	@PostMapping("/register")
	public AuthDtos.TokenResponse register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
		var user = userAccountService.register(req.name(), req.email(), req.password());
		String token = jwtService.createToken(user);
		return new AuthDtos.TokenResponse(token, UserResponse.from(user));
	}

	@PostMapping("/login")
	public AuthDtos.TokenResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
		String token = authService.login(req.email(), req.password());
		var user = userRepository.findByEmailIgnoreCase(req.email().trim().toLowerCase()).orElseThrow();
		return new AuthDtos.TokenResponse(token, UserResponse.from(user));
	}

	/**
	 * Returns the absolute Google OAuth start URL for this server. Use this instead of hard-coding
	 * the API host on the frontend so the browser always hits the Spring Boot app that has
	 * {@code oauth2Login}, not another process on the same port (e.g. standalone Tomcat).
	 */
	@GetMapping("/google-authorization-url")
	public ResponseEntity<Map<String, String>> googleAuthorizationUrl(HttpServletRequest request) {
		ClientRegistrationRepository repo = clientRegistrationRepository.getIfAvailable();
		if (repo == null) {
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
					.body(Map.of("error", "OAuth2 client is not available on this server."));
		}
		ClientRegistration reg = repo.findByRegistrationId("google");
		if (reg == null) {
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
					.body(Map.of("error", "Google OAuth registration is missing."));
		}
		String clientId = reg.getClientId();
		String clientSecret = reg.getClientSecret();
		if (isUnsetGoogleCredential(clientId) || isUnsetGoogleCredential(clientSecret)) {
			String callbackPath = (request.getContextPath() != null ? request.getContextPath() : "")
					+ "/login/oauth2/code/google";
			String callbackExample = ServletUriComponentsBuilder.fromRequest(request)
					.replacePath(callbackPath)
					.replaceQuery(null)
					.fragment(null)
					.build()
					.encode()
					.toUriString();
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
					.body(Map.of(
							"error",
							"Google sign-in is not configured. Set environment variables GOOGLE_CLIENT_ID and "
									+ "GOOGLE_CLIENT_SECRET (see application.properties), restart the backend, and add "
									+ "this redirect URI in Google Cloud Console: " + callbackExample));
		}
		String path = (request.getContextPath() != null ? request.getContextPath() : "")
				+ "/oauth2/authorization/google";
		String url = ServletUriComponentsBuilder.fromRequest(request)
				.replacePath(path)
				.replaceQuery(null)
				.fragment(null)
				.build()
				.encode()
				.toUriString();
		return ResponseEntity.ok(Map.of("url", url));
	}

	@GetMapping("/me")
	public UserResponse me(@AuthenticationPrincipal SecurityUser principal) {
		var user = userAccountService.requireById(principal.getUsername());
		return UserResponse.from(user);
	}

	private static boolean isUnsetGoogleCredential(String value) {
		if (value == null || value.isBlank()) {
			return true;
		}
		if ("placeholder".equalsIgnoreCase(value)) {
			return true;
		}
		return value.startsWith("YOUR_");
	}
}