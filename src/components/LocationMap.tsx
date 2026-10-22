import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type Region,
} from "react-native-maps";
import { useEffect, useMemo, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import type { Coordinates } from "@/lib/deliveryLocation";
import { isGoogleMapsConfigurationMissing } from "@/lib/mapsConfig";

type LocationMapProps = {
  coordinate: Coordinates;
  onSelect: (coordinate: Coordinates) => void;
  showUserLocation: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function LocationMap({
  coordinate,
  onSelect,
  showUserLocation,
  style,
}: LocationMapProps) {
  const mapRef = useRef<MapView>(null);
  const isMapKeyMissing = isGoogleMapsConfigurationMissing();
  const latitude = coordinate.latitude;
  const longitude = coordinate.longitude;
  const region = useMemo<Region>(
    () => ({
      latitude,
      longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }),
    [latitude, longitude],
  );

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 300);
  }, [region]);

  const handleMapPress = (event: MapPressEvent) => {
    onSelect(event.nativeEvent.coordinate);
  };

  return (
    <View style={[{ overflow: "hidden" }, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
      >
        <Marker coordinate={coordinate} title="Delivery address" />
      </MapView>
      {isMapKeyMissing ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            },
          ]}
        >
          <Text className="rounded-xl bg-white/95 p-3 text-center text-sm font-semibold text-primary">
            Add GOOGLE_MAPS_API_KEY to the Expo build environment and rebuild
            the Android app to load map tiles.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
