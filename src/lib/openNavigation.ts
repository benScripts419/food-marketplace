import { Linking } from "react-native";
import type { Coordinates } from "@/lib/deliveryLocation";

/**
 * Opens Google Maps navigation to the customer's delivery location.
 * No Google Maps Platform API key is required.
 */
export async function openNavigation(
  destination: Coordinates,
  address?: string | null
): Promise<void> {
  const valid =
    Number.isFinite(destination.latitude) &&
    Number.isFinite(destination.longitude) &&
    destination.latitude >= -90 &&
    destination.latitude <= 90 &&
    destination.longitude >= -180 &&
    destination.longitude <= 180;

  if (!valid) {
    throw new Error("The delivery coordinates are invalid.");
  }

  const destinationValue =
    `${destination.latitude},${destination.longitude}`;

  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(destinationValue)}` +
    `&travelmode=driving`;

  await Linking.openURL(url);
}