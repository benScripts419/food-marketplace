import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import BottomFade from "@/components/BottomFade";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CategoriesSkeleton,
  RestaurantCardSkeleton,
} from "@/components/Skeletons";
import { useFavorites } from "@/context/FavoritesContext";
import { getCategoryImage } from "@/lib/categoryImages";
import HomeCarousel, { Promotion } from "@/components/HomeCarousel";
import { loadDeliveryLocation } from "@/lib/deliveryLocation";
import { supabase } from "@/lib/supabase";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cuisine: string | null;
  category: string | null;
};

type Category = {
  name: string;
  image: any;
};

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const SLIDE_GAP = 12;
const SLIDE_HEIGHT = 160;
const AUTO_SCROLL_MS = 4000;

// Save the trimmed flyer as assets/images/bestpoint-banner.jpg

// --------------------------------------------------
// HOME SCREEN
// --------------------------------------------------

export default function HomeScreen() {
  const { favoriteRestaurantIds, favoritesLoaded, toggleFavorite } =
    useFavorites();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  const [userName, setUserName] = useState("there");
  const [deliveryAddress, setDeliveryAddress] = useState("Akropong, Ghana");

  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPromotion, setLoadingPromotion] = useState(true);

  // --------------------------------------------------
  // DELIVERY LOCATION
  // --------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadDeliveryLocation()
        .then((location) => {
          if (active) {
            setDeliveryAddress(location?.address ?? "Akropong, Ghana");
          }
        })
        .catch((error: unknown) => {
          console.error("Could not load home delivery location:", error);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  // --------------------------------------------------
  // FETCH USER
  // --------------------------------------------------

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) {
          setUserName("there");
          return;
        }

        const metadata = user.user_metadata ?? {};

        const name =
          metadata.full_name ||
          metadata.name ||
          metadata.first_name ||
          metadata.username;

        const firstName = name ? String(name).trim().split(" ")[0] : "";

        if (firstName) {
          setUserName(firstName);
          return;
        }

        const emailName = user.email?.split("@")[0];
        setUserName(emailName || "there");
      } catch (error) {
        console.error("Failed to load user:", error);
        setUserName("there");
      } finally {
        setLoadingUser(false);
      }
    };

    void fetchUser();
  }, []);

  // --------------------------------------------------
  // LISTEN FOR AUTH CHANGES
  // --------------------------------------------------

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata ?? {};

        const name =
          metadata.full_name ||
          metadata.name ||
          metadata.first_name ||
          metadata.username;

        if (name) {
          const firstName = String(name).trim().split(" ")[0];

          if (firstName) {
            setUserName(firstName);
          }
        } else {
          setUserName(session.user.email?.split("@")[0] || "there");
        }
      } else {
        setUserName("there");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --------------------------------------------------
  // FETCH RESTAURANTS AND CATEGORIES
  // --------------------------------------------------

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name, description, image_url, cuisine, category")
          .order("name");

        if (error) {
          throw error;
        }

        const restaurantData: Restaurant[] = data ?? [];

        setRestaurants(restaurantData);

        const categoryMap = new Map<string, string>();

        restaurantData.forEach((restaurant) => {
          const values = [restaurant.category, restaurant.cuisine].filter(
            Boolean,
          ) as string[];

          values.forEach((value) => {
            value
              .split(/[•,]/)
              .map((item) => item.trim())
              .filter(Boolean)
              .forEach((item) => {
                const key = item.toLowerCase();

                if (!categoryMap.has(key)) {
                  categoryMap.set(key, item);
                }
              });
          });
        });

        const hiddenCategories = [
          "matcha",
          "african",
          "restaurant",
          "bubble tea",
        ];

        const generatedCategories: Category[] = Array.from(
          categoryMap.entries(),
        )
          .filter(([key]) => !hiddenCategories.includes(key))
          .map(([key, name]) => ({
            name,
            image: getCategoryImage(key),
          }))
          .filter((category) => category.image);

        setCategories(generatedCategories);
      } catch (error: any) {
        console.error("Failed to load home restaurants:", {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });

        setRestaurants([]);
        setCategories([]);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    void fetchRestaurants();
  }, []);

  // --------------------------------------------------
  // FETCH PROMOTIONS
  // --------------------------------------------------

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const { data, error } = await supabase
          .from("promotions")
          .select(
            `
              id,
              title,
              subtitle,
              description,
              discount_text,
              button_text,
              image_url,
              restaurant_id,
              day_of_week,
              start_date,
              end_date
            `,
          )
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        const now = new Date();

        const activePromotion =
          data?.find((item) => {
            const startDate = item.start_date
              ? new Date(item.start_date)
              : null;

            const endDate = item.end_date ? new Date(item.end_date) : null;

            return (
              (!startDate || startDate <= now) && (!endDate || endDate >= now)
            );
          }) ?? null;

        setPromotion(activePromotion);
      } catch (error: any) {
        console.error("Failed to load promotion:", {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });

        setPromotion(null);
      } finally {
        setLoadingPromotion(false);
      }
    };

    void fetchPromotion();
  }, []);

  const favoriteRestaurants = restaurants.filter((restaurant) =>
    favoriteRestaurantIds.includes(restaurant.id),
  );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
      >
        <View className="w-full max-w-[1100px] self-center">
          {/* ==========================================
              HEADER
          ========================================== */}

          <View className="px-5 pt-20">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-textSecondary">Welcome back</Text>

                <Text className="mt-1 text-xl font-bold text-text">
                  {loadingUser ? "Hello 👋" : `Hello, ${userName} 👋`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/notifications")}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                className="relative h-11 w-11 items-center justify-center rounded-full bg-surface"
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#171717"
                />

                <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
              </TouchableOpacity>
            </View>

            {/* LOCATION */}

            <TouchableOpacity
              onPress={() => router.push("/location")}
              className="mt-3 flex-row items-center"
              accessibilityRole="button"
              accessibilityLabel="Change delivery location"
            >
              <View>
                <Text className="text-xs text-textSecondary">
                  Delivering to
                </Text>

                <View className="flex-row items-center">
                  <Text
                    className="text-sm font-semibold text-text"
                    numberOfLines={1}
                  >
                    {deliveryAddress}
                  </Text>

                  <Ionicons name="location" size={18} color="#E53935" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ==========================================
              COMBINED PROMOTION + BESTPOINT CAROUSEL
          ========================================== */}

          <View className="mt-5">
            <HomeCarousel promotion={promotion} loading={loadingPromotion} />
          </View>

          {/* ==========================================
              CATEGORIES
          ========================================== */}

          <View className="mt-7">
            <View className="mb-4 flex-row items-center justify-between px-5">
              <Text className="text-lg font-bold text-text">Categories</Text>

              <TouchableOpacity onPress={() => router.push("/categories")}>
                <Text className="text-sm font-semibold text-primary">
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {loadingRestaurants ? (
              <CategoriesSkeleton />
            ) : categories.length === 0 ? (
              <View className="px-5 py-4">
                <Text className="text-sm text-textSecondary">
                  No categories available.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingRight: 30,
                }}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/category/[category]",
                        params: {
                          category: category.name,
                        },
                      })
                    }
                    className="mr-4 items-center"
                  >
                    <View className="h-16 w-16 overflow-hidden rounded-full bg-surface">
                      <Image
                        source={category.image}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    </View>

                    <Text
                      className="mt-2 text-xs font-medium text-text"
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* ==========================================
              POPULAR RESTAURANTS
          ========================================== */}

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between px-5">
              <Text className="text-lg font-bold text-text">
                Popular Restaurants & Food Joints
              </Text>

              <Pressable onPress={() => router.push("/restaurants")}>
                <Text className="text-sm font-semibold text-primary">
                  See all
                </Text>
              </Pressable>
            </View>

            {loadingRestaurants ? (
              <ScrollView
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {[0, 1, 2].map((i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
              </ScrollView>
            ) : restaurants.length === 0 ? (
              <View className="mx-5 rounded-2xl border border-border bg-white p-6">
                <Text className="text-center text-sm text-textSecondary">
                  No restaurants available.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                }}
              >
                {restaurants.map((restaurant) => {
                  const isFavorite = favoriteRestaurantIds.includes(
                    restaurant.id,
                  );

                  const fallbackImage = getCategoryImage(
                    restaurant.category || restaurant.cuisine || "",
                  );

                  return (
                    <Pressable
                      key={restaurant.id}
                      onPress={() =>
                        router.push(`/restaurant/${restaurant.id}`)
                      }
                      className="mr-4 w-56 overflow-hidden rounded-2xl border border-border bg-white"
                    >
                      <View className="w-full overflow-hidden rounded-2xl bg-neutral-900">
                        <View className="relative h-72 w-full">
                          {/* BACKGROUND IMAGE */}
                          {restaurant.image_url ? (
                            <Image
                              source={{ uri: restaurant.image_url }}
                              className="absolute inset-0 h-full w-full"
                              resizeMode="cover"
                            />
                          ) : fallbackImage ? (
                            <Image
                              source={fallbackImage}
                              className="absolute inset-0 h-full w-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="absolute inset-0 items-center justify-center bg-neutral-800">
                              <Ionicons
                                name="restaurant-outline"
                                size={50}
                                color="#FFFFFF"
                              />
                            </View>
                          )}

                          {/* SUBTLE IMAGE OVERLAY */}
                          <View className="absolute inset-0" />

                          {/* FAVORITE BUTTON */}
                          <Pressable
                            onPress={(event) => {
                              event.stopPropagation();
                              void toggleFavorite(restaurant.id).catch(
                                (error: unknown) => {
                                  Alert.alert(
                                    "Could not update favorites",
                                    error instanceof Error
                                      ? error.message
                                      : "Please try again.",
                                  );
                                },
                              );
                            }}
                            disabled={!favoritesLoaded}
                            accessibilityRole="button"
                            accessibilityLabel={
                              isFavorite
                                ? `Remove ${restaurant.name} from favorites`
                                : `Add ${restaurant.name} to favorites`
                            }
                            className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-white/90"
                          >
                            <Ionicons
                              name={isFavorite ? "heart" : "heart-outline"}
                              size={20}
                              color={isFavorite ? "#E53935" : "#171717"}
                            />
                          </Pressable>

                          {/* TEXT OVERLAY (layered bands give a soft edge, no native module) */}
                          <View
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              bottom: 0,
                            }}
                          >
                            <View className="px-4 pb-2 pt-2">
                              <BottomFade />

                              <Text
                                className="text-xl font-bold text-white"
                                numberOfLines={1}
                              >
                                {restaurant.name}
                              </Text>

                              <Text
                                className="mt-1 text-sm text-white/80"
                                numberOfLines={1}
                              >
                                {restaurant.cuisine ||
                                  restaurant.category ||
                                  "Restaurant"}
                              </Text>

                              <View className="mt-3 flex-row items-center">
                                <Ionicons
                                  name="restaurant-outline"
                                  size={14}
                                  color="#FFFFFF"
                                />

                                <Text
                                  className="ml-2 flex-1 text-xs text-white/90"
                                  numberOfLines={1}
                                >
                                  {restaurant.category ||
                                    restaurant.cuisine ||
                                    "Food"}
                                </Text>
                              </View>

                              {restaurant.description ? (
                                <Text
                                  className="mt-2 text-xs leading-5 text-white/80"
                                  numberOfLines={2}
                                >
                                  {restaurant.description}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* ==========================================
              FAVORITE RESTAURANTS
          ========================================== */}

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between px-5">
              <Text className="text-lg font-bold text-text">
                Favorite Restaurants
              </Text>

              <Pressable
                onPress={() => router.push("/favorites")}
                accessibilityRole="button"
                accessibilityLabel="View favorite restaurants"
              >
                <Text className="text-sm font-semibold text-primary">
                  See all
                </Text>
              </Pressable>
            </View>

            {favoriteRestaurants.length === 0 ? (
              <Pressable
                onPress={() => router.push("/restaurants")}
                className="mx-5 flex-row items-center rounded-2xl border border-border bg-white p-4"
              >
                <Ionicons name="heart-outline" size={24} color="#E53935" />

                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-text">
                    Save restaurants you love
                  </Text>

                  <Text className="mt-1 text-xs text-textSecondary">
                    Tap a heart on any restaurant to add it here.
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#737373" />
              </Pressable>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {favoriteRestaurants.map((restaurant) => (
                  <View
                    key={restaurant.id}
                    className="mr-3 w-64 flex-row items-center rounded-2xl border border-border bg-white p-3"
                  >
                    <Pressable
                      onPress={() =>
                        router.push(`/restaurant/${restaurant.id}`)
                      }
                      className="flex-1"
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${restaurant.name}`}
                    >
                      <Text
                        className="text-sm font-bold text-text"
                        numberOfLines={1}
                      >
                        {restaurant.name}
                      </Text>

                      <Text
                        className="mt-1 text-xs text-textSecondary"
                        numberOfLines={1}
                      >
                        {restaurant.cuisine ||
                          restaurant.category ||
                          "Restaurant"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        void toggleFavorite(restaurant.id).catch(
                          (error: unknown) => {
                            Alert.alert(
                              "Could not update favorites",
                              error instanceof Error
                                ? error.message
                                : "Please try again.",
                            );
                          },
                        )
                      }
                      disabled={!favoritesLoaded}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${restaurant.name} from favorites`}
                      className="ml-2 h-10 w-10 items-center justify-center"
                    >
                      <Ionicons name="heart" size={21} color="#E53935" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
