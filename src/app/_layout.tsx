import "../../global.css";

import AuthRedirect from "../components/AuthRedirect";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Stack } from "expo-router";
import { SpeedInsights } from "@vercel/speed-insights/next";

function MobileNotificationSetup() {
  return null;
}

export default function RootLayout() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <SpeedInsights />
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
