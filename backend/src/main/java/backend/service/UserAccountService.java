package backend.service;

import backend.exception.ConflictException;
import backend.exception.NotFoundException;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAccountService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Transactional(readOnly = true)
	public User requireById(String id) {
		return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
	}

	@Transactional
	public User register(String name, String email, String rawPassword) {
		String normalized = email.trim().toLowerCase();
		if (userRepository.findByEmailIgnoreCase(normalized).isPresent()) {
			throw new ConflictException("An account with this email already exists");
		}
		User u = User.builder()
				.id(UUID.randomUUID().toString())
				.email(normalized)
				.passwordHash(passwordEncoder.encode(rawPassword))
				.name(name.trim())
				.role(UserRole.USER)
				.avatar(avatarUrl(name.trim()))
				.createdAt(Instant.now())
				.build();
		return userRepository.save(u);
	}

	@Transactional
	public User findOrCreateOAuthUser(String email, String name, String picture, String googleSub) {
		return userRepository.findByGoogleSub(googleSub)
				.or(() -> userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()))
				.map(existing -> {
					existing.setGoogleSub(googleSub);
					existing.setName(name);
					// Don't overwrite a user-uploaded avatar (stored as data URL).
					// If the user never customized their avatar (blank/dicebear/etc), then we can use Google's picture.
					if (picture != null && !picture.isBlank() && shouldReplaceAvatar(existing.getAvatar())) {
						existing.setAvatar(picture);
					}
					return userRepository.save(existing);
				})
				.orElseGet(() -> userRepository.save(User.builder()
						.id(UUID.randomUUID().toString())
						.email(email.trim().toLowerCase())
						.passwordHash(null)
						.name(name)
						.role(UserRole.USER)
						.avatar(picture != null && !picture.isBlank() ? picture : avatarUrl(name))
						.googleSub(googleSub)
						.createdAt(Instant.now())
						.build()));
	}

	private static boolean shouldReplaceAvatar(String currentAvatar) {
		if (currentAvatar == null || currentAvatar.isBlank()) {
			return true;
		}
		// If it's a custom uploaded image, keep it.
		if (currentAvatar.startsWith("data:image/")) {
			return false;
		}
		// Default generated avatar can be replaced.
		if (currentAvatar.startsWith("https://api.dicebear.com/")) {
			return true;
		}
		// Otherwise preserve whatever the user had.
		return false;
	}

	private static String avatarUrl(String seed) {
		return "https://api.dicebear.com/7.x/avataaars/svg?seed="
				+ java.net.URLEncoder.encode(seed, java.nio.charset.StandardCharsets.UTF_8);
	}
}