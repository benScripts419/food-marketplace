import { router, type Href } from "expo-router";
import { Platform } from "react-native";

// Go back if the app has a previous screen. Otherwise (page opened directly,
// refreshed, or shared as a link) go to a sensible fallback screen.
export function goBack(fallback: Href = "/(tabs)") {
  // Nothing to go back to inside the app.
  if (!router.canGoBack()) {
    router.replace(fallback);
    return;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    // Use the browser's own history, which iPhone Safari handles reliably.
    // If the address doesn't change, fall back so the tap never does nothing.
    const before = window.location.href;
    window.history.back();

    setTimeout(() => {
      if (window.location.href === before) {
        router.replace(fallback);
      }
    }, 350);

    return;
  }

  router.back();
}