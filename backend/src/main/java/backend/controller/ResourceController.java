package backend.controller;

import backend.api.dto.ResourceDtos;
import backend.service.CampusResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

	private final CampusResourceService campusResourceService;

	@GetMapping
	public List<ResourceDtos.ResourceResponse> list() {
		return campusResourceService.list();
	}

	@GetMapping("/{id}")
	public ResourceDtos.ResourceResponse get(@PathVariable String id) {
		return campusResourceService.get(id);
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResourceDtos.ResourceResponse create(@Valid @RequestBody ResourceDtos.UpsertRequest req) {
		return campusResourceService.create(req);
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResourceDtos.ResourceResponse update(
			@PathVariable String id,
			@Valid @RequestBody ResourceDtos.UpsertRequest req) {
		return campusResourceService.update(id, req);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public void delete(@PathVariable String id) {
		campusResourceService.delete(id);
	}
}