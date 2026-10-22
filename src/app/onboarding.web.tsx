import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import WebSiteFooter from "@/components/web-site-footer";
import { getAllMenuItems } from "@/data/restaurantMenus";

import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: string;

  name: string;
};

const accent = "#E53935";

const muted = "#737373";

const featuredHeroImage = require("../../assets/images/food/grilled-chicken.jpg");

const highlights = [
  {
    icon: "restaurant-outline" as const,

    title: "Restaurants nearby",

    description: "Explore neighborhood kitchens and local favorites.",
  },

  {
    icon: "bicycle-outline" as const,

    title: "Delivery to your door",

    description: "Choose a delivery location that works for you.",
  },

  {
    icon: "heart-outline" as const,

    title: "Your favorites, saved",

    description: "Keep the restaurants you love close at hand.",
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();

  const allItems = useMemo(() => getAllMenuItems(), []);

  const featuredItems = useMemo(() => {
    const itemsByRestaurant = new Map<string, (typeof allItems)[number]>();

    allItems.forEach((item) => {
      if (!itemsByRestaurant.has(item.restaurantName)) {
        itemsByRestaurant.set(item.restaurantName, item);
      }
    });

    return Array.from(itemsByRestaurant.values()).slice(0, 4);
  }, [allItems]);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const [restaurantLoadError, setRestaurantLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRestaurants = async () => {
      const { data, error } = await supabase

        .from("restaurants")

        .select("id, name")

        .order("name")

        .limit(8);

      if (!mounted) return;

      if (error) {
        console.error(
          "Could not load restaurants for the web landing page:",
          error,
        );

        setRestaurantLoadError(true);
      } else {
        setRestaurants(data ?? []);
      }

      setLoadingRestaurants(false);
    };

    void loadRestaurants();

    return () => {
      mounted = false;
    };
  }, []);

  const horizontalPadding = width < 360 ? 14 : width < 600 ? 20 : 32;
  const contentWidth = Math.max(
    0,
    Math.min(width - horizontalPadding * 2, 1180),
  );
  const cardGap = 16;
  const cardWidth =
    width < 620
      ? contentWidth
      : width < 900
        ? (contentWidth - cardGap) / 2
        : (contentWidth - cardGap * 3) / 4;
  const heroImageSize =
    width >= 768
      ? Math.min(contentWidth * 0.44, 500)
      : Math.min(contentWidth, 500);
  const galleryStacked = width < 420;

  const openRestaurant = (restaurantName: string, itemId?: string) => {
    const restaurant = restaurants.find(
      (candidate) =>
        candidate.name.trim().toLowerCase() ===
        restaurantName.trim().toLowerCase(),
    );

    if (!restaurant) {
      router.push("/restaurants");

      return;
    }

    router.push({
      pathname: "/restaurant/[id]",

      params: itemId ? { id: restaurant.id, itemId } : { id: restaurant.id },
    });
  };

  return (
    <ScrollView
      className="flex-1"

      style={{ backgroundColor: "#FAFAFA" }}

      contentContainerStyle={{ alignItems: "center", paddingBottom: 0 }}

      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: contentWidth }}>
        <View className="items-center py-8 sm:py-12 md:flex-row md:py-16">
          <View className="z-10 w-full md:w-1/2 md:py-8">
            <Text
              className="text-xs font-bold uppercase tracking-[3px]"

              style={{ color: accent }}
            >
              Good food, close to home
            </Text>

            <Text
              className="mt-4 text-4xl font-extrabold leading-[1.08] sm:text-5xl md:text-6xl"

              style={{ color: "#171717" }}
            >
              Find your next{"\n"}favorite{" "}
              <Text style={{ color: accent }}>meal.</Text>
            </Text>

            <Text
              className="mt-4 max-w-[500px] text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7 md:text-lg"

              style={{ color: muted }}
            >
              Explore restaurants around Akropong, discover Ghanaian favorites
              and comfort food, then get your order delivered.
            </Text>

            <View className="mt-6 flex-row flex-wrap gap-3 sm:mt-7">
              <Pressable
                onPress={() => router.push("/restaurants")}

                className="min-h-12 flex-row items-center justify-center rounded-xl px-4 py-3 sm:px-5"

                style={{ backgroundColor: accent }}
              >
                <Text className="font-bold text-white">
                  Explore restaurants
                </Text>

                <Ionicons
                  name="arrow-forward"

                  size={17}

                  color="#FFFFFF"

                  style={{ marginLeft: 8 }}
                />
              </Pressable>

              <Pressable
                onPress={() => router.push("/categories")}

                className="min-h-12 flex-row items-center justify-center rounded-xl border border-border px-4 py-3 sm:px-5"
              >
                <Text className="font-semibold text-text">
                  Browse categories
                </Text>
              </Pressable>
            </View>

            <View className="mt-9 flex-row flex-wrap">
              {[
                ["location-outline", "Local restaurants"],

                ["bicycle-outline", "Convenient delivery"],

                ["heart-outline", "Favorites saved"],
              ].map(([icon, label]) => (
                <View key={label} className="mb-3 mr-6 flex-row items-center">
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}

                    size={17}

                    color={accent}
                  />

                  <Text className="ml-2 text-xs" style={{ color: muted }}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-7 w-full md:mt-0 md:w-1/2 md:pl-8">
            <View className="relative self-center">
              <View
                className="absolute rounded-full"

                style={{
                  top: "12%",

                  right: "9%",

                  width: "78%",

                  height: "78%",

                  backgroundColor: accent,

                  opacity: 0.1,

                  transform: [{ scale: 1.1 }],
                }}
              />

              <Image
                source={featuredHeroImage}

                resizeMode="cover"

                accessibilityLabel="Grilled chicken meal from the AkroBite menu"

                style={{
                  width: heroImageSize,

                  height: heroImageSize * 0.78,

                  borderRadius: 260,

                  borderWidth: 1,

                  borderColor: "#F3B2B0",
                }}
              />

              <View
                className="absolute bottom-3 left-0 rounded-xl border px-4 py-3"

                style={{
                  backgroundColor: "#FFFFFF",

                  borderColor: "#E5E5E5",
                }}
              >
                <Text className="text-xs font-bold" style={{ color: accent }}>
                  AKROBITE
                </Text>

                <Text className="mt-1 text-xs" style={{ color: "#171717" }}>
                  Good food, delivered
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="items-center border-t border-border py-9 sm:py-12 md:py-16">
          <Text
            className="text-xs font-bold uppercase tracking-[3px]"

            style={{ color: accent }}
          >
            From popular restaurants
          </Text>

          <Text
            className="mt-3 text-center text-3xl font-extrabold md:text-4xl"

            style={{ color: "#171717" }}
          >
            Dishes to <Text style={{ color: accent }}>discover</Text>
          </Text>

          <Text
            className="mt-3 max-w-[560px] text-center text-sm leading-6"

            style={{ color: muted }}
          >
            Take a look at dishes from popular restaurants and open a restaurant
            to browse more.
          </Text>

          {featuredItems.length > 0 ? (
            <View className="mt-6 w-full flex-row flex-wrap justify-center gap-4 sm:mt-8">
              {featuredItems.map((item) => (
                <View
                  key={`${item.restaurantName}-${item.id}`}

                  className="overflow-hidden rounded-2xl border"

                  style={{
                    width: cardWidth,

                    backgroundColor: "#FFFFFF",

                    borderColor: "#E5E5E5",
                  }}
                >
                  <Image
                    source={item.image}

                    resizeMode="cover"

                    accessibilityLabel={item.name}

                    style={{
                      width: "100%",

                      height:
                        width >= 900
                          ? 190
                          : width < 380
                            ? 150
                            : width < 620
                              ? 175
                              : 210,
                    }}
                  />

                  <View className="p-4">
                    <Text
                      className="text-base font-bold"

                      style={{ color: "#171717" }}

                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    <Text
                      className="mt-1 text-xs"

                      style={{ color: muted }}

                      numberOfLines={1}
                    >
                      {item.restaurantName}
                    </Text>

                    <View className="mt-4 flex-row items-center justify-between">
                      <Text
                        className="text-base font-extrabold"
                        style={{ color: accent }}
                      >
                        GH₵{Number(item.price).toFixed(2)}
                      </Text>

                      <Pressable
                        onPress={() =>
                          openRestaurant(item.restaurantName, item.id)
                        }

                        className="h-9 w-9 items-center justify-center rounded-full border border-border"

                        accessibilityLabel={`View ${item.name}`}
                      >
                        <Ionicons
                          name="arrow-forward"

                          size={17}

                          color={accent}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="mt-8 text-sm" style={{ color: muted }}>
              Menu items will appear here as restaurant menus are added.
            </Text>
          )}

          <Pressable
            onPress={() => router.push("/restaurants")}

            className="mt-7 h-11 flex-row items-center justify-center rounded-xl border border-primary px-5"
          >
            <Text className="text-xs font-bold text-primary">
              Browse all restaurants
            </Text>

            <Ionicons
              name="arrow-forward"

              size={15}

              color={accent}

              style={{ marginLeft: 8 }}
            />
          </Pressable>
        </View>

        <View className="border-t border-border py-9 sm:py-12 md:flex-row md:items-center md:py-16">
          <View className="w-full md:w-1/2 md:pr-10">
            <Text
              className="text-xs font-bold uppercase tracking-[3px]"

              style={{ color: accent }}
            >
              About AkroBite
            </Text>

            <Text
              className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl"

              style={{ color: "#171717" }}
            >
              Bringing good food{"\n"}closer to{" "}
              <Text style={{ color: accent }}>home.</Text>
            </Text>

            <Text className="mt-4 text-sm leading-6" style={{ color: muted }}>
              AkroBite helps you discover restaurants around Akropong, browse
              their menus, and order meals for delivery. Find a familiar
              favorite or try something new from a local kitchen.
            </Text>

            <Pressable
              onPress={() => router.push("/restaurants")}

              className="mt-5 flex-row items-center self-start"
            >
              <Text className="text-sm font-bold" style={{ color: accent }}>
                Meet the restaurants
              </Text>

              <Ionicons
                name="arrow-forward"

                size={16}

                color={accent}

                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>

          <View
            className="mt-7 w-full flex-row flex-wrap justify-center gap-3 md:mt-0 md:w-1/2"
            style={{ flexDirection: galleryStacked ? "column" : "row" }}
          >
            <Image
              source={require("../../assets/images/food/food-mix.jpg")}

              resizeMode="cover"

              accessibilityLabel="Pasta from the AkroBite food catalog"

              style={{
                width: galleryStacked ? "100%" : "58%",
                height: width >= 768 ? 330 : width < 380 ? 190 : 240,

                borderRadius: 20,

                borderWidth: 1,

                borderColor: "#E5E5E5",
              }}
            />

            <View
              className="gap-3"
              style={{
                flex: galleryStacked ? undefined : 1,
                width: galleryStacked ? "100%" : undefined,
                flexDirection: galleryStacked ? "row" : "column",
              }}
            >
              <Image
                source={require("../../assets/images/food/pastas.jpg")}

                resizeMode="cover"

                accessibilityLabel="Rice from the AkroBite food catalog"

                style={{
                  width: galleryStacked ? "47%" : "100%",
                  height: width >= 768 ? 158 : width < 380 ? 100 : 112,

                  borderRadius: 18,

                  borderWidth: 1,

                  borderColor: "#E5E5E5",
                }}
              />

              <Image
                source={require("../../assets/images/food/pasta.jpg")}

                resizeMode="cover"

                accessibilityLabel="Pasta from the AkroBite food catalog"

                style={{
                  width: galleryStacked ? "47%" : "100%",
                  height: width >= 768 ? 158 : width < 380 ? 100 : 112,

                  borderRadius: 18,

                  borderWidth: 1,

                  borderColor: "#E5E5E5",
                }}
              />
            </View>
          </View>
        </View>

        <View className="border-t border-border py-9 sm:py-12 md:py-16">
          <View className="flex-row flex-wrap items-end justify-between">
            <View className="max-w-[640px]">
              <Text
                className="text-xs font-bold uppercase tracking-[3px]"

                style={{ color: accent }}
              >
                Simple from start to finish
              </Text>

              <Text
                className="mt-3 text-3xl font-extrabold md:text-4xl"

                style={{ color: "#171717" }}
              >
                A better way to <Text style={{ color: accent }}>order.</Text>
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/restaurants")}

              className="mt-4 flex-row items-center"
            >
              <Text className="text-sm font-bold" style={{ color: accent }}>
                Start exploring
              </Text>

              <Ionicons
                name="arrow-forward"

                size={16}

                color={accent}

                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>

          <View className="mt-6 flex-row flex-wrap justify-center gap-4 sm:mt-8">
            {highlights.map((highlight, index) => (
              <View
                key={highlight.title}

                className="rounded-2xl border p-4 sm:p-5"

                style={{
                  width: cardWidth,

                  backgroundColor: "#FFFFFF",

                  borderColor: "#E5E5E5",
                }}
              >
                <View className="mb-4 h-11 w-11 items-center justify-center rounded-full bg-red-50">
                  <Ionicons
                    name={highlight.icon}

                    size={22}

                    color={accent}
                  />
                </View>

                <Text
                  className="text-base font-bold"

                  style={{ color: "#171717" }}
                >
                  {highlight.title}
                </Text>

                <Text
                  className="mt-2 text-sm leading-5"
                  style={{ color: muted }}
                >
                  {index === 0 && restaurants.length > 0
                    ? `${highlight.description} Browse ${restaurants.length} ${restaurants.length === 1 ? "restaurant" : "restaurants"} or see the full list.`
                    : highlight.description}
                </Text>
              </View>
            ))}
          </View>

          {loadingRestaurants && (
            <View className="mt-5 flex-row items-center self-center">
              <ActivityIndicator color={accent} size="small" />

              <Text className="ml-2 text-xs" style={{ color: muted }}>
                Finding restaurants for you...
              </Text>
            </View>
          )}

          {restaurantLoadError && (
            <Text
              className="mt-5 text-center text-xs"
              style={{ color: "#C62828" }}
            >
              The restaurant list could not be refreshed. Please try again
              later.
            </Text>
          )}
        </View>
      </View>

      {/* Footer scrolls naturally with the page */}
      <View className="w-full">
        <WebSiteFooter />
      </View>
    </ScrollView>
  );
}
