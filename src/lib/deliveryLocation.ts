import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "@/lib/supabase";

export const DELIVERY_LOCATION_STORAGE_KEY = "@akrobite_delivery_location";

const MAX_ADDRESS_LENGTH = 500;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DeliveryLocation = Coordinates & {
  address: string;
};

type StoredDeliveryLocation = DeliveryLocation & {
  userId: string | null;
};

export function isValidCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") return false;

  const coordinates = value as Partial<Coordinates>;

  return (
    typeof coordinates.latitude === "number" &&
    Number.isFinite(coordinates.latitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    typeof coordinates.longitude === "number" &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

// Returns a clean stored location, or null if the saved value is unusable
function parseStoredLocation(value: unknown): StoredDeliveryLocation | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;

  // Check the coordinates on their own object, so `row` isn't narrowed
  const coordinates = { latitude: row.latitude, longitude: row.longitude };
  if (!isValidCoordinates(coordinates)) return null;

  const address = typeof row.address === "string" ? row.address.trim() : "";
  if (!address || address.length > MAX_ADDRESS_LENGTH) return null;

  const userId = row.userId;
  if (userId != null && typeof userId !== "string") return null;

  return {
    address,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    userId: typeof userId === "string" ? userId : null,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error("Could not verify the account for your delivery location.");
  }

  return session?.user.id ?? null;
}

export async function loadDeliveryLocation(): Promise<DeliveryLocation | null> {
  const raw = await AsyncStorage.getItem(DELIVERY_LOCATION_STORAGE_KEY);
  if (!raw) return null;

  let parsed: StoredDeliveryLocation | null = null;

  try {
    parsed = parseStoredLocation(JSON.parse(raw));
  } catch {
    parsed = null;
  }

  // A corrupt saved value is discarded, so the customer is simply asked to
  // choose their location again.
  if (!parsed) {
    console.warn("Discarding an invalid saved delivery location.");
    await AsyncStorage.removeItem(DELIVERY_LOCATION_STORAGE_KEY);
    return null;
  }

  const currentUserId = await getCurrentUserId();

  // Saved by a different account on this device
  if (parsed.userId && parsed.userId !== currentUserId) return null;

  // Saved while signed out: attach it to the account that signs in
  if (!parsed.userId && currentUserId) {
    await AsyncStorage.setItem(
      DELIVERY_LOCATION_STORAGE_KEY,
      JSON.stringify({ ...parsed, userId: currentUserId }),
    );
  }

  return {
    address: parsed.address,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
  };
}

export async function saveDeliveryLocation(
  location: DeliveryLocation,
): Promise<void> {
  const address = location.address.trim();

  if (
    !address ||
    address.length > MAX_ADDRESS_LENGTH ||
    !isValidCoordinates(location)
  ) {
    throw new Error(
      `Choose a valid address of ${MAX_ADDRESS_LENGTH} characters or less before saving.`,
    );
  }

  const userId = await getCurrentUserId();

  const stored: StoredDeliveryLocation = {
    address,
    latitude: location.latitude,
    longitude: location.longitude,
    userId,
  };

  await AsyncStorage.setItem(
    DELIVERY_LOCATION_STORAGE_KEY,
    JSON.stringify(stored),
  );
}

// Call this on logout if you don't want the next person to see the old pin
export async function clearDeliveryLocation(): Promise<void> {
  await AsyncStorage.removeItem(DELIVERY_LOCATION_STORAGE_KEY);
}