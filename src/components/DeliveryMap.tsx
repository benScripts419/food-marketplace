import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import type { Coordinates } from "@/lib/deliveryLocation";
import { openDirections, openInMaps } from "@/lib/mapLinks";

type Props = {
  destination: Coordinates;
  riderLocation?: Coordinates | null;
  style?: StyleProp<ViewStyle>;
};

function ActionButton({
  icon,
  label,
  onPress,
  filled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`mt-3 h-12 flex-row items-center justify-center rounded-xl px-4 ${
        filled ? "bg-primary" : "border border-primary bg-white"
      }`}
    >
      <Ionicons name={icon} size={18} color={filled ? "#FFFFFF" : "#E53935"} />
      <Text
        className={`ml-2 text-sm font-bold ${
          filled ? "text-white" : "text-primary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function DeliveryMap({
  destination,
  riderLocation,
  style,
}: Props) {
  return (
    <View
      style={[{ justifyContent: "center", padding: 20 }, style]}
      className="bg-surface"
    >
      <View className="items-center">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
          <Ionicons name="location" size={28} color="#E53935" />
        </View>

        <Text className="mt-3 text-center text-sm text-textSecondary">
          Open the map in your phone's Maps app
        </Text>
      </View>

      <ActionButton
        filled
        icon="navigate-outline"
        label="Get directions"
        onPress={() => void openDirections(destination)}
      />

      <ActionButton
        icon="map-outline"
        label="View delivery address"
        onPress={() => void openInMaps(destination, "Delivery address")}
      />

      {riderLocation ? (
        <ActionButton
          icon="bicycle-outline"
          label="View rider location"
          onPress={() => void openInMaps(riderLocation, "Your rider")}
        />
      ) : null}
    </View>
  );
}
