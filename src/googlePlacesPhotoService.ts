/**
 * Google Places API Photo Extraction & Validation Service
 * Extracts high-resolution photo_reference URLs from Google Places API photo objects
 * and enforces strict fallback handling to replace null/generic sample images with
 * a robust "No Photo Available" SVG placeholder.
 */

export const NO_PHOTO_AVAILABLE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
      <rect width="800" height="600" fill="#F8FAFC"/>
      <rect x="250" y="180" width="300" height="200" rx="16" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 6"/>
      <path d="M350 260C361.046 260 370 251.046 370 240C370 228.954 361.046 220 350 220C338.954 220 330 228.954 330 240C330 251.046 338.954 260 350 260Z" fill="#94A3B8"/>
      <path d="M290 330L340 280L380 310L440 250L510 330H290Z" fill="#CBD5E1"/>
      <text x="400" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#475569" text-anchor="middle">No Photo Available</text>
      <text x="400" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94A3B8" text-anchor="middle">Property images pending direct Google Places update</text>
    </svg>
  `);

/**
 * Extracts high-resolution photo URLs from Google Places API photos array
 */
export function extractGooglePlacesPhotoUrls(
  photos: any[],
  apiKey?: string,
  maxWidth = 1600
): string[] {
  if (!Array.isArray(photos) || photos.length === 0) {
    return [NO_PHOTO_AVAILABLE_PLACEHOLDER];
  }

  const extracted: string[] = [];

  for (const ph of photos) {
    if (!ph) continue;

    // Case 1: String URL already provided
    if (typeof ph === "string") {
      const trimmed = ph.trim();
      if (isValidPhotoUrl(trimmed)) {
        extracted.push(trimmed);
      }
      continue;
    }

    // Case 2: Object with photo_reference (Google Places API standard)
    const photoRef = ph.photo_reference || ph.photoReference || ph.name;
    if (photoRef && typeof photoRef === "string") {
      if (apiKey && apiKey.length > 5) {
        const fullUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoRef)}&key=${apiKey}`;
        extracted.push(fullUrl);
      } else if (ph.url && typeof ph.url === "string" && isValidPhotoUrl(ph.url)) {
        extracted.push(ph.url.trim());
      }
    } else if (ph.url && typeof ph.url === "string" && isValidPhotoUrl(ph.url)) {
      extracted.push(ph.url.trim());
    }
  }

  return extracted.length > 0 ? extracted : [NO_PHOTO_AVAILABLE_PLACEHOLDER];
}

/**
 * Validates a photo URL to ensure it is not empty, null, or a generic placeholder
 */
export function isValidPhotoUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const lower = url.trim().toLowerCase();
  if (lower === "" || lower === "null" || lower === "undefined") return false;
  
  // Exclude known generic placeholder strings or broken urls
  if (lower.includes("placeholder") && !lower.includes("svg")) return false;
  if (lower.includes("sample-hotel") || lower.includes("fake-photo")) return false;
  
  return true;
}

/**
 * Sanitizes and formats hotel photos, returning a clean primary image and photo gallery list.
 * Priority is given to authentic property images, replacing null/missing photos with No Photo Available.
 */
export function sanitizeHotelPhotoGallery(
  photoUrls?: (string | null | undefined)[],
  existingMainImage?: string | null
): { primaryImage: string; validPhotos: string[] } {
  const cleanList: string[] = [];

  if (existingMainImage && isValidPhotoUrl(existingMainImage)) {
    cleanList.push(existingMainImage.trim());
  }

  if (Array.isArray(photoUrls)) {
    for (const url of photoUrls) {
      if (isValidPhotoUrl(url)) {
        const trimmed = url!.trim();
        if (!cleanList.includes(trimmed)) {
          cleanList.push(trimmed);
        }
      }
    }
  }

  if (cleanList.length === 0) {
    return {
      primaryImage: NO_PHOTO_AVAILABLE_PLACEHOLDER,
      validPhotos: [NO_PHOTO_AVAILABLE_PLACEHOLDER]
    };
  }

  return {
    primaryImage: cleanList[0],
    validPhotos: cleanList
  };
}

/**
 * Checks if an image URL is the "No Photo Available" placeholder
 */
export function isNoPhotoPlaceholder(url?: string | null): boolean {
  if (!url) return true;
  return url.includes("No%20Photo%20Available") || url.includes("No Photo Available");
}
