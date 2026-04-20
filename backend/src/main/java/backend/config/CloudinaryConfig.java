package backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CloudinaryProperties.class)
public class CloudinaryConfig {

	@Bean
	public Cloudinary cloudinary(CloudinaryProperties props) {
		if (props.cloudName() == null || props.cloudName().isBlank()
				|| props.apiKey() == null || props.apiKey().isBlank()
				|| props.apiSecret() == null || props.apiSecret().isBlank()) {
			throw new IllegalStateException("Missing Cloudinary config. Set app.cloudinary.cloud-name/api-key/api-secret in local.properties");
		}
		return new Cloudinary(ObjectUtils.asMap(
				"cloud_name", props.cloudName(),
				"api_key", props.apiKey(),
				"api_secret", props.apiSecret(),
				"secure", true
		));
	}
}

