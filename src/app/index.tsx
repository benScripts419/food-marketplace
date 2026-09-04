import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import Logo from "../components/ui/Logo";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Logo />
    </View>
  );
}
