package backend.controller;

import backend.api.dto.AnalyticsDtos;
import backend.security.SecurityUser;
import backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

	private final AnalyticsService analyticsService;

	@GetMapping("/summary")
	public AnalyticsDtos.AdminAnalyticsResponse summary(
			@RequestParam(required = false) Integer rangeDays,
			@RequestParam(required = false) Integer topN,
			@AuthenticationPrincipal SecurityUser principal) {
		return analyticsService.adminSummary(rangeDays, topN, principal);
	}
}

