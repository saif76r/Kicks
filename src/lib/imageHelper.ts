export const DEFAULT_PRODUCT_IMAGE = '/assets/images/kicks_hero_sneaker_1793611731340.jpg';

export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();

  // If already full data URL or external https URL
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Convert legacy /src/assets/images/ paths to production /assets/images/
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/assets/images/');
  }
  if (trimmed.startsWith('src/assets/images/')) {
    return trimmed.replace('src/assets/images/', '/assets/images/');
  }

  // Ensure leading slash for absolute public path
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}
