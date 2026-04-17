package backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Safety net for environments where Flyway hasn't applied the avatar column migration yet.
 * Ensures users.avatar can store base64 data URLs.
 */
@Configuration
@RequiredArgsConstructor
public class AvatarColumnFixConfig {

	private final JdbcTemplate jdbcTemplate;

	@Bean
	CommandLineRunner ensureAvatarLongText() {
		return args -> {
			try {
				String dataType = jdbcTemplate.queryForObject(
						"""
								SELECT DATA_TYPE
								FROM INFORMATION_SCHEMA.COLUMNS
								WHERE TABLE_SCHEMA = DATABASE()
								  AND TABLE_NAME = 'users'
								  AND COLUMN_NAME = 'avatar'
								""",
						String.class);
				if (dataType == null) {
					return;
				}
				if (!"longtext".equalsIgnoreCase(dataType)) {
					jdbcTemplate.execute("ALTER TABLE users MODIFY avatar LONGTEXT");
				}
			} catch (Exception ignored) {
				// If this fails, the subsequent save will surface a clear SQL error.
			}
		};
	}
}

