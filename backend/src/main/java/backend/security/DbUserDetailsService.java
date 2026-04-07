package backend.security;

import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DbUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return userRepository.findById(username)
				.map(SecurityUser::new)
				.or(() -> userRepository.findByEmailIgnoreCase(username.trim()).map(SecurityUser::new))
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}
}
