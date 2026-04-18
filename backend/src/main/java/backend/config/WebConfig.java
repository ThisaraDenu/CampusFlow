package backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class WebConfig {

	@Bean
	public CorsFilter corsFilter(@Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {
		CorsConfiguration config = new CorsConfiguration();
		// Treat configured values as patterns so dev URLs like http://192.168.*.*:3000 work.
		// Exact origins (e.g. http://localhost:3000) are valid patterns too.
		config.setAllowedOriginPatterns(splitCsv(allowedOrigins));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setExposedHeaders(List.of("Authorization"));
		config.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}

	private static List<String> splitCsv(String value) {
		if (value == null || value.isBlank()) {
			return List.of();
		}
		return List.of(value.split("\\s*,\\s*")).stream()
				.map(String::trim)
				.filter(v -> !v.isBlank())
				.toList();
	}
}
