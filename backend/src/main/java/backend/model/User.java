package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

	@Id
	private String id;

	@Indexed(unique = true)
	private String email;

	private String passwordHash;

	private String name;

	private UserRole role;

	/**
	 * True only for the very first admin account (the "main admin").
	 */
	private boolean mainAdmin;

	private String avatar;

	@Indexed(unique = true, sparse = true)
	private String googleSub;

	private Instant createdAt;
}