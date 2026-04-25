package backend.service;

import backend.api.dto.ResourceDtos;
import backend.exception.BadRequestException;
import backend.exception.NotFoundException;
import backend.model.CampusResource;
import backend.repository.CampusResourceRepository;
import backend.service.CloudinaryImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampusResourceService {

	private final CampusResourceRepository resourceRepository;
	private final CloudinaryImageService cloudinaryImageService;

	@Transactional(readOnly = true)
	public List<ResourceDtos.ResourceResponse> list() {
		return resourceRepository.findAll().stream()
				.map(ResourceDtos.ResourceResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public ResourceDtos.ResourceResponse get(String id) {
		return resourceRepository.findById(id)
				.map(ResourceDtos.ResourceResponse::from)
				.orElseThrow(() -> new NotFoundException("Resource not found"));
	}

	@Transactional
	public ResourceDtos.ResourceResponse create(ResourceDtos.UpsertRequest req) {
		validateTimes(req.availabilityStart(), req.availabilityEnd());
		List<String> days = normalizeDays(req.availableDays());
		List<String> amenities = normalizeList(req.amenities());
		CampusResource r = CampusResource.builder()
				.id(UUID.randomUUID().toString())
				.name(req.name())
				.type(req.type())
				.capacity(req.capacity())
				.location(req.location())
				.availabilityStart(req.availabilityStart())
				.availabilityEnd(req.availabilityEnd())
				.availableDays(days)
				.status(req.status())
				.description(req.description())
				.imageUrl(req.imageUrl())
				.imageUrls(req.imageUrl() != null && !req.imageUrl().isBlank() ? List.of(req.imageUrl()) : List.of())
				.amenities(amenities)
				.equipmentSerialNumber(req.equipmentSerialNumber())
				.labSafetyNotes(req.labSafetyNotes())
				.createdAt(Instant.now())
				.build();
		return ResourceDtos.ResourceResponse.from(resourceRepository.save(r));
	}

	@Transactional
	public ResourceDtos.ResourceResponse update(String id, ResourceDtos.UpsertRequest req) {
		validateTimes(req.availabilityStart(), req.availabilityEnd());
		CampusResource r = resourceRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Resource not found"));
		r.setName(req.name());
		r.setType(req.type());
		r.setCapacity(req.capacity());
		r.setLocation(req.location());
		r.setAvailabilityStart(req.availabilityStart());
		r.setAvailabilityEnd(req.availabilityEnd());
		r.setAvailableDays(normalizeDays(req.availableDays()));
		r.setStatus(req.status());
		r.setDescription(req.description());
		// Keep existing gallery; image updates happen via upload endpoints.
		if (req.imageUrl() != null) {
			r.setImageUrl(req.imageUrl());
		}
		r.setAmenities(normalizeList(req.amenities()));
		r.setEquipmentSerialNumber(req.equipmentSerialNumber());
		r.setLabSafetyNotes(req.labSafetyNotes());
		return ResourceDtos.ResourceResponse.from(resourceRepository.save(r));
	}

	@Transactional
	public void delete(String id) {
		if (!resourceRepository.existsById(id)) {
			throw new NotFoundException("Resource not found");
		}
		resourceRepository.deleteById(id);
	}

	@Transactional
	public ResourceDtos.ResourceResponse uploadImage(String id, MultipartFile file) {
		CampusResource r = resourceRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Resource not found"));
		var uploaded = cloudinaryImageService.uploadImage(file, "campusflow/resources/" + id);
		r.setImageUrl(uploaded.secureUrl());
		List<String> urls = r.getImageUrls() != null ? new ArrayList<>(r.getImageUrls()) : new ArrayList<>();
		if (!urls.contains(uploaded.secureUrl())) {
			urls.add(0, uploaded.secureUrl());
		}
		r.setImageUrls(urls);
		return ResourceDtos.ResourceResponse.from(resourceRepository.save(r));
	}

	@Transactional
	public ResourceDtos.ResourceResponse uploadImages(String id, MultipartFile[] files) {
		CampusResource r = resourceRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Resource not found"));
		if (files == null || files.length == 0) {
			throw new BadRequestException("File required");
		}
		List<String> urls = r.getImageUrls() != null ? new ArrayList<>(r.getImageUrls()) : new ArrayList<>();
		for (MultipartFile f : files) {
			if (f == null || f.isEmpty()) continue;
			var uploaded = cloudinaryImageService.uploadImage(f, "campusflow/resources/" + id);
			if (!urls.contains(uploaded.secureUrl())) {
				urls.add(uploaded.secureUrl());
			}
			if (r.getImageUrl() == null || r.getImageUrl().isBlank()) {
				r.setImageUrl(uploaded.secureUrl());
			}
		}
		r.setImageUrls(urls);
		return ResourceDtos.ResourceResponse.from(resourceRepository.save(r));
	}

	private static void validateTimes(String start, String end) {
		if (start.compareTo(end) >= 0) {
			throw new BadRequestException("availabilityStart must be before availabilityEnd");
		}
	}

	private static List<String> normalizeDays(List<String> days) {
		if (days == null || days.isEmpty()) {
			return List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");
		}
		return days.stream()
				.filter(d -> d != null && !d.isBlank())
				.map(d -> d.trim().toUpperCase())
				.distinct()
				.toList();
	}

	private static List<String> normalizeList(List<String> items) {
		if (items == null) return List.of();
		return items.stream()
				.filter(s -> s != null && !s.isBlank())
				.map(s -> s.trim())
				.distinct()
				.toList();
	}
}