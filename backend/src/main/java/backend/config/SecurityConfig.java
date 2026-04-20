package backend.config;

import backend.security.JwtAuthFilter;
import backend.security.OAuth2LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthFilter jwtAuthFilter;
	private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(Customizer.withDefaults())
				.csrf(csrf -> csrf.disable())
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.exceptionHandling(ex -> ex
						.defaultAuthenticationEntryPointFor(
								new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
								request -> {
									String uri = request.getRequestURI();
									return uri != null && uri.startsWith("/api/");
								}))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/google-authorization-url")
								.permitAll()
						.requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
						.requestMatchers("/api/**").authenticated()
						.anyRequest().permitAll())
				.oauth2Login(o -> o.successHandler(oAuth2LoginSuccessHandler))
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
}
