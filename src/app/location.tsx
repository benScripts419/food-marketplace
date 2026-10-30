import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  loadDeliveryLocation,
  saveDeliveryLocation,
  type Coordinates,
} from "@/lib/deliveryLocation";
import { openInMaps } from "@/lib/mapLinks";

// A fix this tight (in metres) is good enough on its own.
const GOOD_ACCURACY_METERS = 50;

// A looser fix is still accepted, but the customer must add a landmark so the
// rider can find them. Most customers order from indoors, where a phone often
// can't see the satellites and reports 100 m to 300 m.
const LANDMARK_REQUIRED_ABOVE_METERS = 100;

// How long to keep refining the fix, and the accuracy at which to stop early.
const REFINE_SECONDS = 10;
const ACCURATE_ENOUGH_METERS = 25;

// Keeps reading the position for a few seconds and returns the most accurate
// reading. The first reading is usually the roughest; GPS tightens up.
function getBestPosition(): Promise<Location.LocationObject> {
  return new Promise((resolve, reject) => {
    let best: Location.LocationObject | null = null;
    let subscription: Location.LocationSubscription | null = null;
    let finished = false;

    const accuracyOf = (position: Location.LocationObject) =>
      typeof position.coords.accuracy === "number"
        ? position.coords.accuracy
        : Number.POSITIVE_INFINITY;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      subscription?.remove();

      if (best) {
        resolve(best);
      } else {
        reject(new Error("No location fix was received."));
      }
    };

    const timer = setTimeout(finish, REFINE_SECONDS * 1000);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (position) => {
        if (!best || accuracyOf(position) < accuracyOf(best)) {
          best = position;
        }
        if (best && accuracyOf(best) <= ACCURATE_ENOUGH_METERS) {
          finish();
        }
      },
    )
      .then((sub) => {
        subscription = sub;
        if (finished) sub.remove();
      })
      .catch((error: unknown) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        reject(error);
      });
  });
}

const isWeb = Platform.OS === "web";

// Goes back if there is a screen to go back to, otherwise to the fallback.
// Kept inside this screen so saving never depends on another file.
function leaveScreen(fallback: Href) {
  try {
    if (router.canGoBack()) {
      router.back();
      return;
    }
  } catch (error) {
    console.warn("Could not go back:", error);
  }

  router.replace(fallback);
}

// Browsers only allow GPS on secure (https) pages.
function pageIsInsecure(): boolean {
  return (
    isWeb &&
    (globalThis as { isSecureContext?: boolean }).isSecureContext === false
  );
}

function describeLocationError(error: unknown): string {
  if (pageIsInsecure()) {
    return "This page isn't on a secure (https) connection, so the browser blocks GPS. Open the app's secure https link and try again.";
  }

  const text = error instanceof Error ? error.message : "";
  const denied = /denied|permission|not allowed/i.test(text);

  if (denied && isWeb) {
    return "The browser blocked location access. Click the padlock beside the web address, allow Location, then reload the page.";
  }

  if (text) return text;

  return "Could not get your current location. Check your location settings and try again.";
}

export default function LocationScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [coordinate, setCoordinate] = useState<Coordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // A pin saved earlier is NOT fresh: it may belong to another place.
  const [pinFresh, setPinFresh] = useState(false);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);

  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadDeliveryLocation()
      .then((saved) => {
        if (!mounted || !saved) return;

        setCoordinate({
          latitude: saved.latitude,
          longitude: saved.longitude,
        });

        setAddress(saved.address);
        setSavedAddress(saved.address);
      })
      .catch((error: unknown) => {
        console.warn("Could not load saved delivery location", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const useCurrentLocation = async () => {
    setLocating(true);
    setMessage(null);

    try {
      if (pageIsInsecure()) {
        throw new Error("insecure page");
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        throw new Error(
          "Allow location access while using the app, then try again.",
        );
      }

      const enabled = await Location.hasServicesEnabledAsync();

      if (!enabled) {
        throw new Error(
          "Turn on your device's location services and try again.",
        );
      }

      // Read the position for a few seconds and keep the most accurate
      // reading. If that can't run, fall back to a single reading.
      let position: Location.LocationObject;
      try {
        position = await getBestPosition();
      } catch {
        try {
          position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
        } catch {
          position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
      }

      setCoordinate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setAccuracy(
        typeof position.coords.accuracy === "number"
          ? position.coords.accuracy
          : null,
      );
      setPinFresh(true);
    } catch (error) {
      setMessage(describeLocationError(error));
    } finally {
      setLocating(false);
    }
  };

  const checkOnMap = () => {
    if (coordinate) {
      void openInMaps(coordinate, "Your delivery location");
    }
  };

  const save = async () => {
    if (!coordinate) {
      setMessage("Tap Use My Current Location to get your delivery pin.");
      return;
    }

    if (!address.trim()) {
      setMessage("Enter your delivery address or a nearby landmark.");
      return;
    }

    // The address was changed but the pin is still the old one.
    if (
      !pinFresh &&
      savedAddress !== null &&
      address.trim() !== savedAddress.trim()
    ) {
      setMessage(
        "You changed the address, but the pin is still your earlier location. Go to the new delivery spot and tap Use My Current Location.",
      );
      return;
    }

    // A weak fix is accepted, but the rider needs a landmark to find the door.
    if (
      pinFresh &&
      accuracy !== null &&
      accuracy > LANDMARK_REQUIRED_ABOVE_METERS &&
      landmark.trim().length < 3
    ) {
      setMessage(
        `Your location is only accurate to about ${Math.round(accuracy)} m. Add a nearby landmark below so the rider can find you, or try again near a window or outside.`,
      );
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const fullAddress = landmark.trim()
        ? `${address.trim()} (Landmark: ${landmark.trim()})`
        : address.trim();

      await saveDeliveryLocation({
        ...coordinate,
        address: fullAddress,
      });

      if (
        returnTo === "checkout" ||
        returnTo === "payment" ||
        returnTo === "delivery-request"
      ) {
        leaveScreen(
          returnTo === "checkout"
            ? "/checkout"
            : returnTo === "payment"
              ? "/payment"
              : "/delivery-request",
        );
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      // The full error goes to the console, so its source can be found.
      console.error("Saving the delivery location failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your delivery location.",
      );
    } finally {
      setSaving(false);
    }
  };

  const weakFix =
    pinFresh && accuracy !== null && accuracy > LANDMARK_REQUIRED_ABOVE_METERS;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View className="px-5 pb-4 pt-14">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => leaveScreen("/(tabs)")}
              className="h-10 w-10 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={23} color="#171717" />
            </Pressable>

            <Text className="ml-3 text-xl font-bold text-text">
              Delivery location
            </Text>
          </View>

          <Text className="mt-4 text-sm leading-5 text-textSecondary">
            Stand at the place where you want your order delivered, then tap the
            button below. The rider is sent to exactly this spot, and your
            delivery fee is worked out from it.
          </Text>
        </View>

        <View className="mx-5 rounded-2xl border border-border bg-surface p-5">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
            <Ionicons
              name="navigate-circle-outline"
              size={38}
              color="#E53935"
            />
          </View>

          <Text className="mt-3 text-base font-bold text-text">
            Your delivery pin
          </Text>

          <Text className="mt-1 text-sm text-textSecondary">
            {coordinate
              ? `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`
              : "No location selected yet."}
          </Text>

          {coordinate && pinFresh && accuracy !== null ? (
            <Text
              className={`mt-1 text-xs font-semibold ${
                accuracy <= GOOD_ACCURACY_METERS
                  ? "text-green-700"
                  : "text-amber-600"
              }`}
            >
              {accuracy <= GOOD_ACCURACY_METERS
                ? `Accuracy about ${Math.round(accuracy)} m. Good.`
                : weakFix
                  ? `Accuracy about ${Math.round(accuracy)} m. Weak signal: add a landmark below, or try again near a window or outside.`
                  : `Accuracy about ${Math.round(accuracy)} m. Add a landmark to help the rider.`}
            </Text>
          ) : null}

          {coordinate && !pinFresh ? (
            <Text className="mt-1 text-xs text-textSecondary">
              This pin was saved earlier. If you are not at the delivery spot
              now, go there and tap the button again.
            </Text>
          ) : null}

          <Pressable
            onPress={() => void useCurrentLocation()}
            disabled={locating}
            className="mt-4 h-12 flex-row items-center justify-center rounded-xl bg-primary"
          >
            {locating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="locate-outline" size={20} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">
                  Use My Current Location
                </Text>
              </>
            )}
          </Pressable>

          {locating ? (
            <Text className="mt-2 text-center text-xs text-textSecondary">
              Finding the most accurate position. This can take up to{" "}
              {REFINE_SECONDS} seconds.
            </Text>
          ) : null}

          {coordinate ? (
            <Pressable
              onPress={checkOnMap}
              className="mt-3 h-12 flex-row items-center justify-center rounded-xl border border-primary bg-white"
            >
              <Ionicons name="map-outline" size={19} color="#E53935" />
              <Text className="ml-2 font-bold text-primary">
                Check my pin on the map
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mx-5 mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Delivery address
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="House number, street, area or community"
            placeholderTextColor="#737373"
            maxLength={400}
            multiline
            className="min-h-14 rounded-xl border border-border px-4 py-3 text-sm text-text"
          />

          <Text className="mb-2 mt-4 text-sm font-bold text-text">
            {weakFix
              ? "Nearby landmark (required)"
              : "Nearby landmark (optional)"}
          </Text>

          <TextInput
            value={landmark}
            onChangeText={setLandmark}
            placeholder="e.g. opposite the pharmacy or near the school"
            placeholderTextColor="#737373"
            maxLength={150}
            className="rounded-xl border border-border px-4 py-3 text-sm text-text"
          />

          <Text className="mt-3 text-xs leading-5 text-textSecondary">
            The pin comes from GPS, not from the address you type. Use the
            address and landmark to help the rider find the exact door.
          </Text>
        </View>

        {message ? (
          <Text
            accessibilityRole="alert"
            className="mx-5 mt-4 text-sm text-primary"
          >
            {message}
          </Text>
        ) : null}

        <Pressable
          onPress={() => void save()}
          disabled={saving}
          className={`mx-5 mt-5 h-14 items-center justify-center rounded-xl ${
            saving ? "bg-border" : "bg-primary"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Save delivery location</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
