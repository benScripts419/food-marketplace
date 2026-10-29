import {
  Linking,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

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
  const mapsUrl = riderLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${riderLocation.latitude},${riderLocation.longitude}&destination=${destination.latitude},${destination.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;

  const openMap = async () => {
    try {
      await Linking.openURL(mapsUrl);
    } catch (error) {
      console.error("Could not open Google Maps:", error);
    }
  };

  return (
    <View
      style={[
        {
          minHeight: 180,
          padding: 20,
          borderRadius: 12,
          backgroundColor: "#F5F5F5",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: "#171717",
        }}
      >
        Delivery map
      </Text>

      <Text
        style={{
          textAlign: "center",
          color: "#737373",
          fontSize: 13,
        }}
      >
        {riderLocation
          ? "View the rider's current location and delivery route."
          : "Open the customer's delivery location in Google Maps."}
      </Text>

      <Pressable
        onPress={() => void openMap()}
        accessibilityRole="link"
        style={
          {
            backgroundColor: "#C62828",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 10,
            cursor: "pointer",
          } as never
        }
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
          {riderLocation ? "View delivery route" : "View delivery location"}
        </Text>
      </Pressable>
    </View>
  );
}
