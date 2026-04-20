package backend.service;

import backend.exception.BadRequestException;
import backend.model.User;
import backend.repository.UserRepository;
import backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	@Transactional(readOnly = true)
	public String login(String email, String password) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new BadRequestException("Invalid email or password"));
		if (user.getPasswordHash() == null
				|| !passwordEncoder.matches(password, user.getPasswordHash())) {
			throw new BadRequestException("Invalid email or password");
		}
		return jwtService.createToken(user);
	}
}