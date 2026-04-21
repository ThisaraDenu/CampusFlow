package backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

	@Value("${app.frontend.url:http://localhost:3000}")
	private String frontendUrl;

	@Override
	public void onAuthenticationFailure(
			HttpServletRequest request,
			HttpServletResponse response,
			AuthenticationException exception) throws IOException {

		String msg = exception.getMessage() != null ? exception.getMessage() : "OAuth sign-in failed";
		String target = frontendUrl + "/login?oauthError="
				+ URLEncoder.encode(msg, StandardCharsets.UTF_8);
		getRedirectStrategy().sendRedirect(request, response, target);
	}
}

