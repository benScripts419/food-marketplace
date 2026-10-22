import { Linking } from "react-native";

export type MapPoint = {
  latitude: number;
  longitude: number;
};

// A Google Maps link with turn-by-turn directions. With no starting point
// given, Google Maps starts from the rider's current position.
export function directionsUrl(
  destination: MapPoint | null,
  fallbackAddress?: string | null,
): string | null {
  if (destination) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
  }

  const address = fallbackAddress?.trim();
  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, Ghana`)}&travelmode=driving`;
  }

  return null;
}

// Returns false if there is nothing to navigate to, or the link can't open.
export async function openDirections(
  destination: MapPoint | null,
  fallbackAddress?: string | null,
): Promise<boolean> {
  const url = directionsUrl(destination, fallbackAddress);
  if (!url) return false;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}