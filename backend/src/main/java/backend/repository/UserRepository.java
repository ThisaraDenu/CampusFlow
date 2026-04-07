package backend.repository;

import backend.model.User;
import backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

	Optional<User> findByEmailIgnoreCase(String email);

	Optional<User> findByGoogleSub(String googleSub);

	Optional<User> findFirstByRoleOrderByCreatedAtAsc(UserRole role);

	List<User> findByRole(UserRole role);
}