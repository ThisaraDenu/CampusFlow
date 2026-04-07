package backend.security;

import backend.config.JwtProperties;
import backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

	private final JwtProperties jwtProperties;

	private SecretKey key() {
		byte[] bytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
		return Keys.hmacShaKeyFor(bytes);
	}

	public String createToken(User user) {
		Date now = new Date();
		Date exp = new Date(now.getTime() + jwtProperties.getExpirationMs());
		return Jwts.builder()
				.subject(user.getId())
				.claim("email", user.getEmail())
				.claim("role", user.getRole().name())
				.issuedAt(now)
				.expiration(exp)
				.signWith(key())
				.compact();
	}

	public String parseSubject(String token) {
		Claims claims = Jwts.parser()
				.verifyWith(key())
				.build()
				.parseSignedClaims(token)
				.getPayload();
		return claims.getSubject();
	}
}