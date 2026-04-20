package backend.config;

import backend.model.User;
import backend.model.UserRole;
import backend.repository.UserRepository;
import backend.service.UserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Bootstrap a first admin account for local/dev environments.
 *
 * Enabled only when app.bootstrap-admin.email + app.bootstrap-admin.password are provided.
 * Credentials should live in local.properties (gitignored) or environment variables.
 */
@Configuration
@RequiredArgsConstructor
public class BootstrapAdminConfig {

	private final UserRepository userRepository;
	private final UserAccountService userAccountService;
	private final PasswordEncoder passwordEncoder;

	@Bean
	CommandLineRunner bootstrapAdmin(
			@Value("${app.bootstrap-admin.email:}") String email,
			@Value("${app.bootstrap-admin.password:}") String password,
			@Value("${app.bootstrap-admin.name:Admin}") String name) {
		return args -> {
			if (email == null || email.isBlank() || password == null || password.isBlank()) {
				return;
			}

			String normalized = email.trim().toLowerCase();

			var existing = userRepository.findByEmailIgnoreCase(normalized);
			if (existing.isPresent()) {
				var u = existing.get();
				boolean changed = false;
				if (u.getRole() != UserRole.ADMIN) {
					u.setRole(UserRole.ADMIN);
					changed = true;
				}
				// Bootstrap admin is always considered the "main admin".
				if (!u.isMainAdmin()) {
					u.setMainAdmin(true);
					changed = true;
				}
				// Keep password in sync for local/dev convenience.
				if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {
					u.setPasswordHash(passwordEncoder.encode(password));
					changed = true;
				}
				if (changed) {
					userRepository.save(u);
				}
				return;
			}

			// Only create a new user if there isn't an admin yet (avoid surprising existing envs).
			if (!userRepository.findByRole(UserRole.ADMIN).isEmpty()) {
				return;
			}

			var u = userAccountService.register(name, normalized, password);
			u.setRole(UserRole.ADMIN);
			u.setMainAdmin(true);
			userRepository.save(u);
		};
	}
}

