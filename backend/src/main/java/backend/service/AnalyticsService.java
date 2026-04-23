package backend.service;

import backend.api.dto.AnalyticsDtos;
import backend.exception.ForbiddenException;
import backend.model.Booking;
import backend.model.Ticket;
import backend.model.TicketStatus;
import backend.model.User;
import backend.model.UserRole;
import backend.repository.BookingRepository;
import backend.repository.CampusResourceRepository;
import backend.repository.TicketRepository;
import backend.repository.UserRepository;
import backend.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

	private final BookingRepository bookingRepository;
	private final TicketRepository ticketRepository;
	private final CampusResourceRepository resourceRepository;
	private final UserRepository userRepository;

	@Transactional(readOnly = true)
	public AnalyticsDtos.AdminAnalyticsResponse adminSummary(Integer rangeDays, Integer topN, SecurityUser principal) {
		User u = userRepository.findById(principal.getUsername()).orElseThrow();
		if (u.getRole() != UserRole.ADMIN) {
			throw new ForbiddenException();
		}

		int days = rangeDays == null ? 30 : Math.max(1, Math.min(365, rangeDays));
		int n = topN == null ? 5 : Math.max(1, Math.min(20, topN));

		Instant now = Instant.now();
		Instant start = now.minus(days, ChronoUnit.DAYS);
		ZoneId zone = ZoneId.systemDefault();

		List<Booking> bookings = bookingRepository.findAll().stream()
				.filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(start))
				.toList();

		Map<LocalDate, Long> bookingCounts = new HashMap<>();
		for (Booking b : bookings) {
			LocalDate day = b.getCreatedAt().atZone(zone).toLocalDate();
			bookingCounts.put(day, bookingCounts.getOrDefault(day, 0L) + 1L);
		}
		List<AnalyticsDtos.DayCount> bookingsPerDay = bookingCounts.entrySet().stream()
				.sorted(Map.Entry.comparingByKey())
				.map(e -> new AnalyticsDtos.DayCount(e.getKey(), e.getValue()))
				.toList();

		Map<String, Long> bookingsByResource = new HashMap<>();
		for (Booking b : bookings) {
			if (b.getResourceId() == null) continue;
			bookingsByResource.put(b.getResourceId(), bookingsByResource.getOrDefault(b.getResourceId(), 0L) + 1L);
		}
		List<AnalyticsDtos.ResourceCount> topResources = bookingsByResource.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.limit(n)
				.map(e -> {
					String rid = e.getKey();
					String name = resourceRepository.findById(rid).map(r -> r.getName()).orElse("Unknown");
					return new AnalyticsDtos.ResourceCount(rid, name, e.getValue());
				})
				.toList();

		List<Ticket> tickets = ticketRepository.findAll().stream()
				.filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().isBefore(start))
				.toList();

		Map<String, Long> ticketsByStatus = new HashMap<>();
		Map<String, Long> ticketsByPriority = new HashMap<>();
		for (Ticket t : tickets) {
			String s = t.getStatus() != null ? t.getStatus().name() : "UNKNOWN";
			String p = t.getPriority() != null ? t.getPriority().name() : "UNKNOWN";
			ticketsByStatus.put(s, ticketsByStatus.getOrDefault(s, 0L) + 1L);
			ticketsByPriority.put(p, ticketsByPriority.getOrDefault(p, 0L) + 1L);
		}

		List<AnalyticsDtos.NamedCount> statusCounts = ticketsByStatus.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.map(e -> new AnalyticsDtos.NamedCount(e.getKey(), e.getValue()))
				.toList();
		List<AnalyticsDtos.NamedCount> priorityCounts = ticketsByPriority.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.map(e -> new AnalyticsDtos.NamedCount(e.getKey(), e.getValue()))
				.toList();

		List<Ticket> resolvedInRange = ticketRepository.findAll().stream()
				.filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED)
				.filter(t -> t.getCreatedAt() != null && t.getUpdatedAt() != null)
				.filter(t -> !t.getUpdatedAt().isBefore(start))
				.toList();

		Double avgResolutionHours = null;
		if (!resolvedInRange.isEmpty()) {
			double avgMillis = resolvedInRange.stream()
					.map(t -> Duration.between(t.getCreatedAt(), t.getUpdatedAt()).toMillis())
					.filter(ms -> ms >= 0)
					.mapToLong(Long::longValue)
					.average()
					.orElse(Double.NaN);
			if (!Double.isNaN(avgMillis)) {
				avgResolutionHours = avgMillis / (1000.0 * 60.0 * 60.0);
			}
		}

		return new AnalyticsDtos.AdminAnalyticsResponse(
				bookingsPerDay,
				topResources,
				statusCounts,
				priorityCounts,
				avgResolutionHours);
	}
}

