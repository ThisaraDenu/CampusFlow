package backend.api.dto;

import backend.model.CampusResource;
import backend.model.ResourceStatus;
import backend.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public class ResourceDtos {

	public record ResourceResponse(
			String id,
			String name,
			ResourceType type,
			int capacity,
			String location,
			String availabilityStart,
			String availabilityEnd,
			List<String> availableDays,
			ResourceStatus status,
			String description,
			String imageUrl,
			List<String> imageUrls,
			List<String> amenities,
			String equipmentSerialNumber,
			String labSafetyNotes,
			Instant createdAt
	) {
		public static ResourceResponse from(CampusResource r) {
			return new ResourceResponse(
					r.getId(),
					r.getName(),
					r.getType(),
					r.getCapacity(),
					r.getLocation(),
					r.getAvailabilityStart(),
					r.getAvailabilityEnd(),
					r.getAvailableDays(),
					r.getStatus(),
					r.getDescription(),
					r.getImageUrl(),
					r.getImageUrls(),
					r.getAmenities(),
					r.getEquipmentSerialNumber(),
					r.getLabSafetyNotes(),
					r.getCreatedAt());
		}
	}

	public record UpsertRequest(
			@NotBlank @Size(max = 255) String name,
			@NotNull ResourceType type,
			@NotNull @Min(1) @Max(5000) Integer capacity,
			@NotBlank @Size(max = 512) String location,
			@NotBlank String availabilityStart,
			@NotBlank String availabilityEnd,
			List<String> availableDays,
			@NotNull ResourceStatus status,
			String description,
			List<String> amenities,
			@Size(max = 128) String equipmentSerialNumber,
			@Size(max = 2000) String labSafetyNotes,
			String imageUrl
	) {
	}
}