import "../../global.css";

import WebSiteFooter from "@/components/web-site-footer";
import WebSiteHeader from "@/components/web-site-header";
import { CartProvider } from "@/context/CartContext";
import { Stack, usePathname } from "expo-router";
import { View } from "react-native";

export default function WebRootLayout() {
  const pathname = usePathname();
  const isPublicScreen = [
    "/",
    "/onboarding",
    "/login",
    "/signup",
    "/forgot-password",
  ].includes(pathname);

  return (
    <CartProvider>
      <View className="flex-1 bg-[#fffdf9]">
        <WebSiteHeader />
        <View className={`flex-1 ${isPublicScreen ? "" : "pt-[72px]"}`}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>
        {!isPublicScreen ? <WebSiteFooter /> : null}
      </View>
    </CartProvider>
  );
}
