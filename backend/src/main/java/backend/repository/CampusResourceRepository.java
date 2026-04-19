package backend.repository;

import backend.model.CampusResource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CampusResourceRepository extends MongoRepository<CampusResource, String> {
}