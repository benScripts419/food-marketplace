import Constants from "expo-constants";
import { Platform } from "react-native";

export function isGoogleMapsConfigurationMissing() {
  return (
    Platform.OS === "android" &&
    Constants.expoConfig?.extra?.googleMapsApiKeyConfigured !== true
  );
}
