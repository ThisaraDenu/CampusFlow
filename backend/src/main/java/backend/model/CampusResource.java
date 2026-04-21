package backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusResource {

	@Id
	private String id;

	private String name;

	private ResourceType type;

	private Integer capacity;

	private String location;

	private String availabilityStart;

	private String availabilityEnd;

	private ResourceStatus status;

	private String description;

	private String imageUrl;

	private List<String> imageUrls;

	private List<String> availableDays;

	private List<String> amenities;

	// Type-specific optional fields
	private String equipmentSerialNumber;

	private String labSafetyNotes;

	private Instant createdAt;
}