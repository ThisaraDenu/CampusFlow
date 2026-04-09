package backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusResource {

	@Id
	@Column(length = 36)
	private String id;

	@Column(nullable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 64)
	private ResourceType type;

	@Column(nullable = false)
	private Integer capacity;

	@Column(nullable = false, length = 512)
	private String location;

	@Column(name = "availability_start", nullable = false, length = 8)
	private String availabilityStart;

	@Column(name = "availability_end", nullable = false, length = 8)
	private String availabilityEnd;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private ResourceStatus status;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "image_url", columnDefinition = "TEXT")
	private String imageUrl;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}