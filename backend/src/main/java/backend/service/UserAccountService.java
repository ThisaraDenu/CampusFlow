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
					if (picture != null && !picture.isBlank()) {
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

	private static String avatarUrl(String seed) {
		return "https://api.dicebear.com/7.x/avataaars/svg?seed="
				+ java.net.URLEncoder.encode(seed, java.nio.charset.StandardCharsets.UTF_8);
	}
}