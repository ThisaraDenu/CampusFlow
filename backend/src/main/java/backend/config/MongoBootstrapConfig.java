package backend.config;

import backend.model.Booking;
import backend.model.CampusResource;
import backend.model.Notification;
import backend.model.Ticket;
import backend.model.TicketAttachment;
import backend.model.TicketComment;
import backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
@RequiredArgsConstructor
public class MongoBootstrapConfig {

	private final MongoTemplate mongoTemplate;

	@Bean
	CommandLineRunner ensureMongoCollections() {
		return args -> {
			createIfMissing(User.class);
			createIfMissing(CampusResource.class);
			createIfMissing(Booking.class);
			createIfMissing(Ticket.class);
			createIfMissing(TicketComment.class);
			createIfMissing(TicketAttachment.class);
			createIfMissing(Notification.class);
		};
	}

	private void createIfMissing(Class<?> entityClass) {
		if (!mongoTemplate.collectionExists(entityClass)) {
			mongoTemplate.createCollection(entityClass);
		}
	}
}

