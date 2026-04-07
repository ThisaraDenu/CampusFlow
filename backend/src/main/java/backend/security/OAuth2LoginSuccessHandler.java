package backend.security;

import backend.service.UserAccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final UserAccountService userAccountService;
	private final JwtService jwtService;

	@Value("${app.frontend.url:http://localhost:3000}")
	private String frontendUrl;

	@Override
	public void onAuthenticationSuccess(
			HttpServletRequest request,
			HttpServletResponse response,
			Authentication authentication) throws IOException {

		OAuth2User oauth = (OAuth2User) authentication.getPrincipal();
		String sub = oauth.getName();
		String email = oauth.getAttribute("email");
		if (email == null || email.isBlank()) {
			email = sub + "@google.oauth";
		}
		String name = oauth.getAttribute("name");
		if (name == null || name.isBlank()) {
			name = email;
		}
		String picture = oauth.getAttribute("picture");

		var user = userAccountService.findOrCreateOAuthUser(email, name, picture, sub);
		String token = jwtService.createToken(user);
		String target = frontendUrl + "/auth/callback#token="
				+ URLEncoder.encode(token, StandardCharsets.UTF_8);
		getRedirectStrategy().sendRedirect(request, response, target);
	}
}
