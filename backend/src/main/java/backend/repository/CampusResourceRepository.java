package backend.repository;

import backend.model.CampusResource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusResourceRepository extends JpaRepository<CampusResource, String> {
}