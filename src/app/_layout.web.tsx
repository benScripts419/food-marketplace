import "../../global.css";

import WebSiteHeader from "@/components/web-site-header";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { WebAuthProvider } from "@/context/WebAuthContext";
import AuthRedirect from "../components/AuthRedirect";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function WebRootLayout() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <WebAuthProvider>
          <AuthRedirect />

          <View className="min-h-[100vh] w-full flex-1 bg-background">
            <WebSiteHeader />

            <View className="w-full min-w-0 flex-1">
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </View>
        </WebAuthProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}
