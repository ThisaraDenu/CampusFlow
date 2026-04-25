package backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketSlaScheduler {

	private final TicketService ticketService;

	@Scheduled(fixedDelayString = "${app.ticket-sla.check-interval-ms:300000}")
	public void checkOverdueTickets() {
		ticketService.notifyOverdueTickets();
	}
}

