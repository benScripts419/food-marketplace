import { WebView } from "react-native-webview";
import type { StyleProp, ViewStyle } from "react-native";

import type { Coordinates } from "@/lib/deliveryLocation";

type LocationMapProps = {
  coordinate: Coordinates;
  onSelect: (coordinate: Coordinates) => void;
  showUserLocation: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function LocationMap({
  coordinate,
  style,
}: LocationMapProps) {
  const mapUrl = `https://maps.google.com/maps?q=${coordinate.latitude},${coordinate.longitude}&z=15&output=embed`;

  return (
    <WebView
      source={{ uri: mapUrl }}
      style={style}
      accessibilityLabel="Google Map showing the selected delivery area"
    />
  );
}
