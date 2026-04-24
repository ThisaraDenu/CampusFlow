package backend.api.dto;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsDtos {

	public record DayCount(LocalDate day, long count) {
	}

	public record NamedCount(String name, long count) {
	}

	public record ResourceCount(String resourceId, String resourceName, long count) {
	}

	public record AdminAnalyticsResponse(
			List<DayCount> bookingsPerDay,
			List<ResourceCount> topResources,
			List<NamedCount> ticketsByStatus,
			List<NamedCount> ticketsByPriority,
			Double avgResolutionHours) {
	}
}

