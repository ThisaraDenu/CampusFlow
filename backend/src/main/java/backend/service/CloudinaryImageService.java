package backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryImageService {

	private final Cloudinary cloudinary;

	public record UploadResult(String publicId, String secureUrl) {
	}

	public UploadResult uploadFile(MultipartFile file, String folder) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Missing file");
		}
		long maxBytes = 10L * 1024 * 1024;
		if (file.getSize() > maxBytes) {
			throw new IllegalArgumentException("File too large (max 10MB)");
		}

		String contentType = file.getContentType();
		String resourceType =
				(contentType != null && contentType.toLowerCase().startsWith("image/"))
						? "image"
						: "raw";

		byte[] bytes;
		try {
			bytes = file.getBytes();
		} catch (IOException e) {
			throw new IllegalArgumentException("Could not read file");
		}

		Map<?, ?> res;
		try {
			res = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
					"folder", folder,
					"resource_type", resourceType
			));
		} catch (Exception e) {
			throw new IllegalStateException("Cloudinary upload failed: " + e.getMessage(), e);
		}

		String publicId = (String) res.get("public_id");
		String secureUrl = (String) res.get("secure_url");
		if (publicId == null || secureUrl == null) {
			throw new IllegalStateException("Cloudinary upload returned no URL");
		}
		return new UploadResult(publicId, secureUrl);
	}

	public UploadResult uploadImage(MultipartFile file, String folder) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Missing file");
		}
		String contentType = file.getContentType();
		if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
			throw new IllegalArgumentException("Only image uploads are allowed");
		}
		long maxBytes = 5L * 1024 * 1024;
		if (file.getSize() > maxBytes) {
			throw new IllegalArgumentException("Image too large (max 5MB)");
		}

		byte[] bytes;
		try {
			bytes = file.getBytes();
		} catch (IOException e) {
			throw new IllegalArgumentException("Could not read file");
		}

		Map<?, ?> res;
		try {
			res = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
					"folder", folder,
					"resource_type", "image"
			));
		} catch (Exception e) {
			throw new IllegalStateException("Cloudinary upload failed: " + e.getMessage(), e);
		}

		String publicId = (String) res.get("public_id");
		String secureUrl = (String) res.get("secure_url");
		if (publicId == null || secureUrl == null) {
			throw new IllegalStateException("Cloudinary upload returned no URL");
		}
		return new UploadResult(publicId, secureUrl);
	}

	public void deleteByPublicId(String publicId, String resourceType) {
		if (publicId == null || publicId.isBlank()) {
			return;
		}
		try {
			String rt = resourceType == null || resourceType.isBlank()
					? "image"
					: resourceType;
			cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
					"resource_type", rt,
					"invalidate", true
			));
		} catch (Exception ignored) {
			// Best-effort cleanup; DB record is the source of truth for the app.
		}
	}
}

