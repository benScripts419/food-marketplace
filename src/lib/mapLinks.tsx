import { Linking, Platform } from "react-native";

import type { Coordinates } from "@/lib/deliveryLocation";

// A place is either saved coordinates or a typed address
export type MapTarget = Coordinates | string;

function destination(target: MapTarget) {
  return typeof target === "string"
    ? encodeURIComponent(target)
    : `${target.latitude},${target.longitude}`;
}

// OpenStreetMap works in any browser and needs no key
function browserFallback(target: MapTarget) {
  if (typeof target === "string") {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(target)}`;
  }
  const { latitude, longitude } = target;
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

function pinUrl(target: MapTarget, label?: string) {
  if (Platform.OS === "android") {
    const query =
      typeof target === "string"
        ? encodeURIComponent(target)
        : `${target.latitude},${target.longitude}(${encodeURIComponent(label ?? "Location")})`;
    return `geo:0,0?q=${query}`;
  }

  if (Platform.OS === "ios") {
    return typeof target === "string"
      ? `http://maps.apple.com/?q=${destination(target)}`
      : `http://maps.apple.com/?ll=${target.latitude},${target.longitude}&q=${encodeURIComponent(label ?? "Location")}`;
  }

  return browserFallback(target);
}

function directionsUrl(target: MapTarget) {
  if (Platform.OS === "ios") {
    return `http://maps.apple.com/?daddr=${destination(target)}&dirflg=d`;
  }
  // A plain link: opens the Google Maps app if installed, otherwise the browser
  return `https://www.google.com/maps/dir/?api=1&destination=${destination(target)}&travelmode=driving`;
}

async function open(url: string, fallback: string) {
  try {
    await Linking.openURL(url);
  } catch {
    try {
      await Linking.openURL(fallback);
    } catch (error) {
      console.error("Could not open a maps app:", error);
    }
  }
}

export function openInMaps(target: MapTarget, label?: string) {
  return open(pinUrl(target, label), browserFallback(target));
}

export function openDirections(target: MapTarget) {
  return open(directionsUrl(target), browserFallback(target));
}
