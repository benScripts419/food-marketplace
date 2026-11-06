import "../../global.css";

import AuthRedirect from "../components/AuthRedirect";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function MobileNotificationSetup() {
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let mounted = true;

    const registerNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const permissionRequest = await Notifications.requestPermissionsAsync();
        finalStatus = permissionRequest.status;
      }

      if (finalStatus !== "granted") {
        console.log("Notifications permission not granted on this device.");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      if (mounted && token) {
        console.log("Push token ready for mobile notifications:", token);
      }
    };

    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Foreground notification received:", notification.request.content.title);
      },
    );

    void registerNotifications();

    return () => {
      mounted = false;
      receivedListener.remove();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <AuthRedirect />
        <MobileNotificationSetup />

        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="rider" />
        </Stack>
      </FavoritesProvider>
    </CartProvider>
  );
}
