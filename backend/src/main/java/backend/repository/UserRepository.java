package backend.repository;

import backend.model.User;
import backend.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

	Optional<User> findByEmailIgnoreCase(String email);

	Optional<User> findByGoogleSub(String googleSub);

	List<User> findByRole(UserRole role);
}