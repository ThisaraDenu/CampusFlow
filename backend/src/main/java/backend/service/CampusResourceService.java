package backend.service;

import backend.api.dto.ResourceDtos;
import backend.exception.BadRequestException;
import backend.exception.NotFoundException;
import backend.model.CampusResource;
import backend.repository.CampusResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampusResourceService {

	private final CampusResourceRepository resourceRepository;

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
		CampusResource r = CampusResource.builder()
				.id(UUID.randomUUID().toString())
				.name(req.name())
				.type(req.type())
				.capacity(req.capacity())
				.location(req.location())
				.availabilityStart(req.availabilityStart())
				.availabilityEnd(req.availabilityEnd())
				.status(req.status())
				.description(req.description())
				.imageUrl(req.imageUrl())
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
		r.setStatus(req.status());
		r.setDescription(req.description());
		r.setImageUrl(req.imageUrl());
		return ResourceDtos.ResourceResponse.from(resourceRepository.save(r));
	}

	@Transactional
	public void delete(String id) {
		if (!resourceRepository.existsById(id)) {
			throw new NotFoundException("Resource not found");
		}
		resourceRepository.deleteById(id);
	}

	private static void validateTimes(String start, String end) {
		if (start.compareTo(end) >= 0) {
			throw new BadRequestException("availabilityStart must be before availabilityEnd");
		}
	}
}