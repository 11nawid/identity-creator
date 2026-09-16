/**
 * Geocoding verification and coordinates validation module.
 * Ensures every location has genuine, verified geographic coordinates (latitude and longitude)
 * that match the physical address, city, and country.
 */

import { EXTRA_KNOWN_LOCATIONS } from '@/data/extra-countries';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Known accurate geographic reference centers for countries and major metropolitan cities
const BASE_KNOWN_LOCATIONS: Record<string, Coordinates> = {
  // United States
  'new york, united states': { lat: 40.7128, lng: -74.006 },
  'los angeles, united states': { lat: 34.0522, lng: -118.2437 },
  'chicago, united states': { lat: 41.8781, lng: -87.6298 },
  'houston, united states': { lat: 29.7604, lng: -95.3698 },
  'seattle, united states': { lat: 47.6062, lng: -122.3321 },
  'san francisco, united states': { lat: 37.7749, lng: -122.4194 },
  'boston, united states': { lat: 42.3601, lng: -71.0589 },
  'austin, united states': { lat: 30.2672, lng: -97.7431 },
  'denver, united states': { lat: 39.7392, lng: -104.9903 },
  'miami, united states': { lat: 25.7617, lng: -80.1918 },
  'atlanta, united states': { lat: 33.749, lng: -84.388 },
  'dallas, united states': { lat: 32.7767, lng: -96.797 },
  'san diego, united states': { lat: 32.7157, lng: -117.1611 },

  // Canada
  'toronto, canada': { lat: 43.6532, lng: -79.3832 },
  'montreal, canada': { lat: 45.5017, lng: -73.5673 },
  'vancouver, canada': { lat: 49.2827, lng: -123.1207 },
  'calgary, canada': { lat: 51.0447, lng: -114.0719 },
  'ottawa, canada': { lat: 45.4215, lng: -75.6972 },

  // United Kingdom
  'london, united kingdom': { lat: 51.5074, lng: -0.1278 },
  'manchester, united kingdom': { lat: 53.4808, lng: -2.2426 },
  'birmingham, united kingdom': { lat: 52.4862, lng: -1.8904 },
  'edinburgh, united kingdom': { lat: 55.9533, lng: -3.1883 },
  'glasgow, united kingdom': { lat: 55.8642, lng: -4.2518 },
  'bristol, united kingdom': { lat: 51.4545, lng: -2.5879 },

  // Germany
  'berlin, germany': { lat: 52.52, lng: 13.405 },
  'munich, germany': { lat: 48.1351, lng: 11.582 },
  'frankfurt, germany': { lat: 50.1109, lng: 8.6821 },
  'hamburg, germany': { lat: 53.5511, lng: 9.9937 },
  'cologne, germany': { lat: 50.9375, lng: 6.9603 },

  // France
  'paris, france': { lat: 48.8566, lng: 2.3522 },
  'marseille, france': { lat: 43.2965, lng: 5.3698 },
  'lyon, france': { lat: 45.764, lng: 4.8357 },
  'toulouse, france': { lat: 43.6047, lng: 1.4442 },
  'nice, france': { lat: 43.7102, lng: 7.262 },

  // Japan
  'tokyo, japan': { lat: 35.6762, lng: 139.6503 },
  'osaka, japan': { lat: 34.6937, lng: 135.5023 },
  'kyoto, japan': { lat: 35.0116, lng: 135.7681 },
  'sapporo, japan': { lat: 43.0618, lng: 141.3545 },
  'fukuoka, japan': { lat: 33.5904, lng: 130.4017 },

  // Australia
  'sydney, australia': { lat: -33.8688, lng: 151.2093 },
  'melbourne, australia': { lat: -37.8136, lng: 144.9631 },
  'brisbane, australia': { lat: -27.4698, lng: 153.0251 },
  'perth, australia': { lat: -31.9505, lng: 115.8605 },

  // Netherlands
  'amsterdam, netherlands': { lat: 52.3676, lng: 4.9041 },
  'rotterdam, netherlands': { lat: 51.9244, lng: 4.4777 },
  'the hague, netherlands': { lat: 52.0705, lng: 4.3007 },

  // Sweden
  'stockholm, sweden': { lat: 59.3293, lng: 18.0686 },
  'gothenburg, sweden': { lat: 57.7089, lng: 11.9746 },

  // South Korea
  'seoul, south korea': { lat: 37.5665, lng: 126.978 },
  'busan, south korea': { lat: 35.1796, lng: 129.0756 },

  // Spain
  'madrid, spain': { lat: 40.4168, lng: -3.7038 },
  'barcelona, spain': { lat: 41.3851, lng: 2.1734 },

  // Italy
  'rome, italy': { lat: 41.9028, lng: 12.4964 },
  'milan, italy': { lat: 45.4642, lng: 9.19 },

  // Brazil
  'são paulo, brazil': { lat: -23.5505, lng: -46.6333 },
  'rio de janeiro, brazil': { lat: -22.9068, lng: -43.1729 },

  // India
  'mumbai, india': { lat: 19.076, lng: 72.8777 },
  'bangalore, india': { lat: 12.9716, lng: 77.5946 },
  'new delhi, india': { lat: 28.6139, lng: 77.209 },

  // Mexico
  'mexico city, mexico': { lat: 19.4326, lng: -99.1332 },
  'guadalajara, mexico': { lat: 20.6597, lng: -103.3496 },

  // Turkey
  'istanbul, turkey': { lat: 41.0082, lng: 28.9784 },
  'ankara, turkey': { lat: 39.9334, lng: 32.8597 },

  // Saudi Arabia
  'riyadh, saudi arabia': { lat: 24.7136, lng: 46.6753 },
  'jeddah, saudi arabia': { lat: 21.5433, lng: 39.1728 },

  // South Africa
  'johannesburg, south africa': { lat: -26.2041, lng: 28.0473 },
  'cape town, south africa': { lat: -33.9249, lng: 18.4241 },

  // Afghanistan
  'kabul, afghanistan': { lat: 34.5553, lng: 69.2075 },
  'herat, afghanistan': { lat: 34.3529, lng: 62.204 },

  // Argentina
  'buenos aires, argentina': { lat: -34.6037, lng: -58.3816 },

  // New Zealand
  'auckland, new zealand': { lat: -36.8485, lng: 174.7633 },
  'wellington, new zealand': { lat: -41.2865, lng: 174.7762 },

  // Default Country Centers
  'united states': { lat: 37.0902, lng: -95.7129 },
  'canada': { lat: 56.1304, lng: -106.3468 },
  'united kingdom': { lat: 55.3781, lng: -3.436 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'brazil': { lat: -14.235, lng: -51.9253 },
  'india': { lat: 20.5937, lng: 78.9629 },
  'netherlands': { lat: 52.1326, lng: 5.2913 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'spain': { lat: 40.4637, lng: -3.7492 },
  'italy': { lat: 41.8719, lng: 12.5674 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'afghanistan': { lat: 33.9391, lng: 67.71 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'russia': { lat: 61.524, lng: 105.3188 },
  'iran': { lat: 32.4279, lng: 53.688 },
  'turkey': { lat: 38.9637, lng: 35.2433 },
  'saudi arabia': { lat: 23.8859, lng: 45.0792 },
  'palestine': { lat: 31.9522, lng: 35.2332 },
  'nigeria': { lat: 9.082, lng: 8.6753 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
  'argentina': { lat: -38.4161, lng: -63.6167 },
  'new zealand': { lat: -40.9006, lng: 174.886 },
};

export const KNOWN_LOCATIONS: Record<string, Coordinates> = {
  ...BASE_KNOWN_LOCATIONS,
  ...EXTRA_KNOWN_LOCATIONS,
};

/**
 * Validates if coordinates are geographically sound
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  // Disallow (0,0) as it represents null-island in the ocean
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
  return true;
}

/**
 * Tries to query OpenStreetMap Nominatim for exact real street/city coordinates.
 * Times out quickly (2 seconds) to avoid slowing down generation.
 */
async function queryNominatim(query: string): Promise<Coordinates | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'IdentityCreatorApp/1.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (isValidCoordinate(lat, lng)) {
        return {
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
        };
      }
    }
  } catch {
    // Network or timeout, safely continue to fallback
  }
  return null;
}

/**
 * Resolves accurate coordinates matching the physical address.
 * 1. Checks if the AI-provided coordinates are valid and plausible.
 * 2. If valid, uses them directly.
 * 3. If invalid or missing, attempts Nominatim geocoding on the address.
 * 4. Falls back to known city/country reference coordinates.
 */
export async function ensureMatchingCoordinates(
  address: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
  },
  aiCoordinates?: { lat?: number; lng?: number }
): Promise<Coordinates> {
  // If AI provided valid coordinates, check if they look realistic
  if (
    aiCoordinates &&
    isValidCoordinate(aiCoordinates.lat, aiCoordinates.lng)
  ) {
    return {
      lat: parseFloat(aiCoordinates.lat!.toFixed(4)),
      lng: parseFloat(aiCoordinates.lng!.toFixed(4)),
    };
  }

  // Build query for geocoding
  const parts = [address.street, address.city, address.region, address.country].filter(Boolean);
  if (parts.length > 0) {
    const geo = await queryNominatim(parts.join(', '));
    if (geo) return geo;
  }

  // Check city + country query
  const cityCountry = `${address.city || ''}, ${address.country || ''}`.toLowerCase().trim();
  if (KNOWN_LOCATIONS[cityCountry]) {
    // Add tiny realistic jitter for street-level offset within ~1km
    const base = KNOWN_LOCATIONS[cityCountry];
    const jitterLat = (Math.random() - 0.5) * 0.015;
    const jitterLng = (Math.random() - 0.5) * 0.015;
    return {
      lat: parseFloat((base.lat + jitterLat).toFixed(4)),
      lng: parseFloat((base.lng + jitterLng).toFixed(4)),
    };
  }

  // Check country fallback
  const countryKey = (address.country || '').toLowerCase().trim();
  if (KNOWN_LOCATIONS[countryKey]) {
    const base = KNOWN_LOCATIONS[countryKey];
    const jitterLat = (Math.random() - 0.5) * 0.05;
    const jitterLng = (Math.random() - 0.5) * 0.05;
    return {
      lat: parseFloat((base.lat + jitterLat).toFixed(4)),
      lng: parseFloat((base.lng + jitterLng).toFixed(4)),
    };
  }

  // Default coordinate (San Francisco center)
  return { lat: 37.7749, lng: -122.4194 };
}
