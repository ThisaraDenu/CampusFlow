package backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

	@Id
	@Column(length = 36)
	private String id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 64)
	private String type;

	@Column(nullable = false, length = 512)
	private String title;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String message;

	@JsonProperty("isRead")
	@Column(name = "is_read", nullable = false)
	private boolean readFlag;

	@Column(name = "related_id", length = 36)
	private String relatedId;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;
}