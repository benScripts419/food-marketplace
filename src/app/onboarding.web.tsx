import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const highlights = [
  {
    icon: "restaurant-outline" as const,
    label: "Local favorites",
  },
  {
    icon: "bicycle-outline" as const,
    label: "Fast delivery",
  },
  {
    icon: "sparkles-outline" as const,
    label: "Fresh every day",
  },
];

const { width } = useWindowDimensions();

const imageWidth = Math.min(width * 0.95, 720);

export default function OnboardingScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-[700px] self-center px-5 py-8 md:px-8 md:py-12 lg:px-10 lg:py-16">
        {/* Illustration */}
        <View className="w-full items-center justify-center">
          <View className="w-full max-w-[600px] items-center justify-center">
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={{
                width: imageWidth,
                height: imageWidth / 1.5,
              }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content */}
        <View className="mt-6 w-full md:mt-8">
          <Text className="mb-3 text-xs font-bold uppercase tracking-[2px] text-primary md:text-sm md:tracking-[3px]">
            Good food, close to home
          </Text>

          <Text className="text-4xl font-bold leading-[46px] text-text md:text-5xl md:leading-[58px] lg:text-6xl lg:leading-[68px]">
            Delicious food delivered to you.
          </Text>

          <Text className="mt-5 max-w-[600px] text-base leading-6 text-textSecondary md:text-lg md:leading-7">
            Discover the best restaurants around Akropong and enjoy Ghanaian
            favorites, comfort food, and quick delivery at your door.
          </Text>

          {/* CTA */}
          <Pressable
            onPress={() => router.push("/login")}
            className="mt-7 h-14 w-full flex-row items-center justify-center rounded-xl bg-primary px-6 md:mt-8 md:w-52"
          >
            <Text className="font-bold text-white">Start ordering</Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 10 }}
            />
          </Pressable>

          {/* Highlights */}
          <View className="mt-7 flex-row flex-wrap items-center md:mt-8">
            {highlights.map((highlight) => (
              <View
                key={highlight.label}
                className="mb-3 mr-5 flex-row items-center"
              >
                <Ionicons name={highlight.icon} size={18} color="#E53935" />

                <Text className="ml-2 text-sm font-medium text-textSecondary">
                  {highlight.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Information */}
        <View className="mt-8 border-t border-[#e5ddd2] pt-6 md:mt-10 md:pt-8">
          <Text className="text-xl font-bold text-text">
            Made for your neighborhood
          </Text>

          <Text className="mt-1 text-sm text-textSecondary">
            Your next favorite meal is only a few taps away.
          </Text>

          <Pressable
            onPress={() => router.push("/restaurants")}
            className="mt-4 self-start"
          >
            <Text className="text-sm font-bold text-primary">
              Explore restaurants
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
