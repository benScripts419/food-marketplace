import { router } from "expo-router";
import { useEffect } from "react";
import { Image, View, useWindowDimensions } from "react-native";

export default function SplashScreen() {
  const { width } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Responsive logo size
  const logoWidth = Math.min(width * 0.65, 320);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require("../../assets/images/akrobite-logo.png")}
        style={{
          width: logoWidth,
          height: logoWidth * 0.4,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
