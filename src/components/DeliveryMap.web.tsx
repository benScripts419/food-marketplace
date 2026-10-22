import { WebView } from "react-native-webview";
import type { StyleProp, ViewStyle } from "react-native";

import type { Coordinates } from "@/lib/deliveryLocation";

type DeliveryMapProps = {
  destination: Coordinates;
  riderLocation: Coordinates | null;
  style?: StyleProp<ViewStyle>;
};

export default function DeliveryMap({
  destination,
  riderLocation,
  style,
}: DeliveryMapProps) {
  const roundedRiderLocation = riderLocation
    ? {
        latitude: Number(riderLocation.latitude.toFixed(3)),
        longitude: Number(riderLocation.longitude.toFixed(3)),
      }
    : null;
  const mapUrl = riderLocation
    ? `https://maps.google.com/maps?saddr=${roundedRiderLocation?.latitude},${roundedRiderLocation?.longitude}&daddr=${destination.latitude},${destination.longitude}&output=embed`
    : `https://maps.google.com/maps?q=${destination.latitude},${destination.longitude}&z=15&output=embed`;

  return (
    <WebView
      source={{ uri: mapUrl }}
      style={style}
      accessibilityLabel={
        riderLocation
          ? "Google Map showing the rider's latest location"
          : "Google Map showing the customer's delivery address"
      }
    />
  );
}
