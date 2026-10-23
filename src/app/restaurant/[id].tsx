import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import {
  getRestaurantMenuByName,
  type MenuCategory,
  type MenuItem as RestaurantMenuItem,
} from "@/data/restaurantMenus";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cuisine: string | null;
  category: string | null;
  subCategory: string | null;
  rating: number | null;
};

const ROLLD_UP_RESTAURANT_ID = "0a7aae53-94c5-428c-88c5-3e6cd88ee911";

export default function RestaurantDetailScreen() {
  // --------------------------------------------------
  // ROUTE PARAMETERS
  // --------------------------------------------------

  const params = useLocalSearchParams<{
    id?: string;
    itemId?: string;
  }>();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const itemId = Array.isArray(params.itemId)
    ? params.itemId[0]
    : params.itemId;

  // --------------------------------------------------
  // SCREEN
  // --------------------------------------------------

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const imageSize = isSmallScreen ? 82 : 92;

  // --------------------------------------------------
  // CART
  // --------------------------------------------------

  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    selectFreeItem,
    freeItemPromptVisible,
    dismissFreeItemPrompt,
  } = useCart();
  const { isFavorite, toggleFavorite, favoritesLoaded } = useFavorites();

  // --------------------------------------------------
  // REFS
  // --------------------------------------------------

  const scrollViewRef = useRef<ScrollView>(null);

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [menu, setMenu] = useState<MenuCategory[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");

  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [itemPositions, setItemPositions] = useState<Record<string, number>>(
    {},
  );

  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );

  const [isFreeSelectionMode, setIsFreeSelectionMode] = useState(false);

  // --------------------------------------------------
  // FREE ITEM PROMOTION PROMPT
  // --------------------------------------------------

  useEffect(() => {
    if (!freeItemPromptVisible || restaurant?.id !== ROLLD_UP_RESTAURANT_ID) {
      return;
    }

    Alert.alert(
      "🎉 Free item unlocked!",
      "You've selected 3 Roll'd Up items. Choose one item to get FREE.",
      [
        {
          text: "Choose free item",
          onPress: () => {
            dismissFreeItemPrompt();
            setIsFreeSelectionMode(true);
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  }, [freeItemPromptVisible, restaurant?.id, dismissFreeItemPrompt]);

  // --------------------------------------------------
  // LOAD RESTAURANT
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const fetchRestaurant = async () => {
      if (!id) {
        setError("Restaurant not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("restaurants")
          .select("id, name, description, image_url, cuisine, category, rating")
          .eq("id", id)
          .maybeSingle();

        if (supabaseError) {
          throw supabaseError;
        }

        if (!data) {
          throw new Error("Restaurant not found.");
        }

        if (!mounted) {
          return;
        }

        const restaurantData = data as Restaurant;

        setRestaurant(restaurantData);

        // Get the restaurant menu from local TypeScript data.
        const restaurantMenu = getRestaurantMenuByName(restaurantData.name);

        setMenu(restaurantMenu);

        if (restaurantMenu.length > 0) {
          setSelectedCategory(restaurantMenu[0].id);
          setSelectedSubCategory("All");
        }
      } catch (err) {
        console.error("Error fetching restaurant:", err);

        if (mounted) {
          setError("Unable to load this restaurant.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRestaurant();

    return () => {
      mounted = false;
    };
  }, [id]);

  // --------------------------------------------------
  // SELECTED MENU CATEGORY
  // --------------------------------------------------

  const selectedMenuCategory = menu.find(
    (category) => category.id === selectedCategory,
  );

  // --------------------------------------------------
  // SUB-FILTERS
  // --------------------------------------------------

  const subCategories = [
    "All",
    ...Array.from(
      new Set(
        selectedMenuCategory?.items
          .map((item) => item.subCategory)
          .filter((subCategory): subCategory is string =>
            Boolean(subCategory),
          ) ?? [],
      ),
    ),
  ];

  // --------------------------------------------------
  // FILTERED MENU ITEMS
  // --------------------------------------------------

  const filteredItems =
    selectedMenuCategory?.items.filter((item) => {
      if (selectedSubCategory === "All") {
        return true;
      }

      return item.subCategory === selectedSubCategory;
    }) ?? [];

  // --------------------------------------------------
  // GET ITEM QUANTITY
  // --------------------------------------------------

  const getItemQuantity = (menuItemId: string) => {
    if (!restaurant) {
      return 0;
    }

    const cartItem = cartItems.find(
      (item) => item.id === menuItemId && item.restaurantId === restaurant.id,
    );

    return cartItem?.quantity ?? 0;
  };

  // --------------------------------------------------
  // CREATE CART ITEM
  // --------------------------------------------------

  const createCartItem = (item: RestaurantMenuItem) => {
    if (!restaurant) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    };
  };

  // --------------------------------------------------
  // ADD ITEM / SELECT FREE ITEM
  // --------------------------------------------------

  const handleAddToCart = (item: RestaurantMenuItem) => {
    if (!restaurant) {
      return;
    }

    const cartItem = createCartItem(item);

    if (!cartItem) {
      return;
    }

    // FREE ITEM MODE

    if (isFreeSelectionMode) {
      selectFreeItem(cartItem);
      setIsFreeSelectionMode(false);

      Alert.alert(
        "🎁 Free item added!",
        `${item.name} has been added to your cart for FREE.`,
      );

      return;
    }

    // NORMAL PAID ITEM

    addToCart(cartItem);
  };

  // --------------------------------------------------
  // INCREASE QUANTITY
  // --------------------------------------------------

  const handleIncrease = (item: RestaurantMenuItem) => {
    if (!restaurant) {
      return;
    }

    const cartItem = createCartItem(item);

    if (!cartItem) {
      return;
    }

    // FREE ITEM MODE

    if (isFreeSelectionMode) {
      selectFreeItem(cartItem);
      setIsFreeSelectionMode(false);

      Alert.alert(
        "🎁 Free item added!",
        `${item.name} has been added to your cart for FREE.`,
      );

      return;
    }

    // NORMAL QUANTITY INCREASE

    increaseQuantity(item.id, restaurant.id);
  };

  // --------------------------------------------------
  // DECREASE QUANTITY
  // --------------------------------------------------

  const handleDecrease = (item: RestaurantMenuItem) => {
    if (!restaurant) {
      return;
    }

    // Don't change quantities while choosing
    // a free item.

    if (isFreeSelectionMode) {
      return;
    }

    decreaseQuantity(item.id, restaurant.id);
  };

  // --------------------------------------------------
  // CATEGORY
  // --------------------------------------------------

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Reset cup-size filter when switching categories.

    setSelectedSubCategory("All");

    // Remove deep-link highlight when user manually changes category.

    setHighlightedItemId(null);
  };

  // --------------------------------------------------
  // DEEP LINK TO MENU ITEM
  // --------------------------------------------------

  useEffect(() => {
    if (!itemId || menu.length === 0) {
      return;
    }

    const category = menu.find((menuCategory) =>
      menuCategory.items.some((item) => item.id === itemId),
    );

    if (!category) {
      return;
    }

    setSelectedCategory(category.id);
    setSelectedSubCategory("All");
    setHighlightedItemId(itemId);
  }, [itemId, menu]);

  // --------------------------------------------------
  // SCROLL TO DEEP-LINKED ITEM
  // --------------------------------------------------

  useEffect(() => {
    if (!itemId) {
      return;
    }

    const position = itemPositions[itemId];

    if (position === undefined) {
      return;
    }

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(position - 20, 0),
        animated: true,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [itemId, itemPositions, selectedCategory, selectedSubCategory]);

  // --------------------------------------------------
  // RESTAURANT CART
  // --------------------------------------------------

  const restaurantCartItems = restaurant
    ? cartItems.filter((item) => item.restaurantId === restaurant.id)
    : [];

  const cartCount = restaurantCartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = restaurantCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#E53935" />

        <Text className="mt-3 text-sm text-textSecondary">
          Loading restaurant...
        </Text>
      </View>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error || !restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Ionicons name="restaurant-outline" size={30} color="#E53935" />
        </View>

        <Text className="mt-4 text-center text-lg font-bold text-text">
          Restaurant unavailable
        </Text>

        <Text className="mt-2 text-center text-sm text-textSecondary">
          {error ?? "We couldn't find this restaurant."}
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // --------------------------------------------------
  // RESTAURANT IMAGE
  // --------------------------------------------------

  const restaurantImage = restaurant.image_url
    ? {
        uri: restaurant.image_url,
      }
    : require("@/assets/images/akrobite-logo.png");

  // --------------------------------------------------
  // SCREEN
  // --------------------------------------------------

  return (
    <View className="flex-1 bg-background">
      {/* -------------------------------------------------- */}
      {/* FIXED RESTAURANT SECTION */}
      {/* -------------------------------------------------- */}

      <View>
        {/* HERO IMAGE */}

        <View className="relative h-[230px] w-full">
          <Image
            source={restaurantImage}
            className="h-full w-full"
            resizeMode="cover"
          />

          <View className="absolute inset-0 bg-black/25" />

          {/* BACK BUTTON */}

          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          {/* FAVORITE BUTTON */}

          <Pressable
            onPress={() =>
              void toggleFavorite(restaurant.id).catch((error: unknown) => {
                Alert.alert(
                  "Could not update favorites",
                  error instanceof Error ? error.message : "Please try again.",
                );
              })
            }
            disabled={!favoritesLoaded}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite(restaurant.id)
                ? `Remove ${restaurant.name} from favorites`
                : `Add ${restaurant.name} to favorites`
            }
            className="absolute right-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name={isFavorite(restaurant.id) ? "heart" : "heart-outline"}
              size={21}
              color={isFavorite(restaurant.id) ? "#E53935" : "#171717"}
            />
          </Pressable>
        </View>

        {/* RESTAURANT INFO */}

        <View className="rounded-t-3xl bg-background px-5 pb-4 pt-5">
          <Text className="text-2xl font-bold text-text">
            {restaurant.name}
          </Text>

          {restaurant.description ? (
            <Text className="mt-2 text-sm leading-5 text-textSecondary">
              {restaurant.description}
            </Text>
          ) : null}

          <View className="mt-3 flex-row items-center">
            <Ionicons name="star" size={15} color="#F59E0B" />

            <Text className="ml-1 text-sm font-semibold text-text">
              {restaurant.rating != null ? restaurant.rating.toFixed(1) : "New"}
            </Text>

            <Text className="mx-2 text-sm text-border">•</Text>

            <Text
              className="flex-1 text-sm text-textSecondary"
              numberOfLines={1}
            >
              {restaurant.cuisine ?? restaurant.category ?? "Restaurant"}
            </Text>
          </View>
        </View>

        {/* FREE ITEM SELECTION BANNER */}

        {isFreeSelectionMode ? (
          <View className="mx-5 mb-4 rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Ionicons name="gift-outline" size={22} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-white">
                  Choose your FREE item
                </Text>

                <Text className="mt-1 text-xs leading-4 text-white/90">
                  Tap any Roll'd Up item below to get it free.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* MAIN CATEGORY TABS */}

        {menu.length > 0 ? (
          <View className="border-b border-border bg-background">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 12,
              }}
            >
              {menu.map((category) => {
                const isSelected = selectedCategory === category.id;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => handleCategoryPress(category.id)}
                    className={`mr-3 rounded-full px-4 py-2.5 ${
                      isSelected ? "bg-primary" : "bg-surface"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected ? "text-white" : "text-textSecondary"
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* SUBCATEGORY FILTER */}

        {selectedMenuCategory && subCategories.length > 1 ? (
          <View className="bg-background px-5 pt-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 4,
              }}
            >
              {subCategories.map((subCategory) => {
                const isSelected = selectedSubCategory === subCategory;

                return (
                  <Pressable
                    key={subCategory}
                    onPress={() => setSelectedSubCategory(subCategory)}
                    className={`mr-2 rounded-full px-4 py-2 ${
                      isSelected ? "bg-primary" : "bg-surface"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-white" : "text-textSecondary"
                      }`}
                    >
                      {subCategory}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {/* -------------------------------------------------- */}
      {/* ONLY MENU ITEMS SCROLL */}
      {/* -------------------------------------------------- */}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: cartCount > 0 ? 120 : 40,
        }}
      >
        {/* MENU */}

        {menu.length === 0 ? (
          <View className="items-center rounded-2xl border border-border bg-white px-6 py-10">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <Ionicons name="fast-food-outline" size={28} color="#737373" />
            </View>

            <Text className="mt-4 text-center text-base font-bold text-text">
              Menu coming soon
            </Text>

            <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
              This restaurant has not added its menu yet.
            </Text>
          </View>
        ) : selectedMenuCategory ? (
          filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);

              return (
                <View
                  key={item.id}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;

                    setItemPositions((previous) => ({
                      ...previous,
                      [item.id]: y,
                    }));
                  }}
                  className={`mb-4 flex-row rounded-2xl border p-3 ${
                    highlightedItemId === item.id
                      ? "border-primary bg-red-50"
                      : "border-border bg-white"
                  }`}
                >
                  {/* FOOD IMAGE */}

                  <Image
                    source={item.image}
                    className="rounded-xl bg-[#f3f0e7]"
                    style={{
                      width: imageSize,
                      height: imageSize,
                    }}
                    resizeMode="contain"
                  />

                  {/* FOOD DETAILS */}

                  <View className="ml-3 flex-1">
                    {/* ITEM NAME */}

                    <Text
                      className="text-base font-bold text-text"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    {/* SELECTED ITEM BADGE */}

                    {highlightedItemId === item.id ? (
                      <View className="mt-1 self-start rounded-full bg-primary px-2 py-1">
                        <Text className="text-[10px] font-bold text-white">
                          Selected item
                        </Text>
                      </View>
                    ) : null}

                    {/* DESCRIPTION */}

                    {item.description ? (
                      <Text
                        className="mt-1 text-xs leading-4 text-textSecondary"
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    ) : null}

                    {/* PRICE */}

                    <Text className="mt-2 text-base font-bold text-primary">
                      GH₵
                      {item.price.toFixed(2)}
                    </Text>
                  </View>

                  {/* ADD / QUANTITY */}

                  <View className="ml-2 justify-end">
                    {isFreeSelectionMode ? (
                      <Pressable
                        onPress={() => handleAddToCart(item)}
                        className="h-9 w-9 items-center justify-center rounded-full bg-primary"
                      >
                        <Ionicons
                          name="gift-outline"
                          size={20}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    ) : quantity === 0 ? (
                      <Pressable
                        onPress={() => handleAddToCart(item)}
                        className="h-9 w-9 items-center justify-center rounded-full bg-primary"
                      >
                        <Ionicons name="add" size={22} color="#FFFFFF" />
                      </Pressable>
                    ) : (
                      <View className="flex-row items-center rounded-full bg-surface">
                        <Pressable
                          onPress={() => handleDecrease(item)}
                          className="h-9 w-9 items-center justify-center"
                        >
                          <Ionicons name="remove" size={18} color="#E53935" />
                        </Pressable>

                        <Text className="min-w-[22px] text-center text-sm font-bold text-text">
                          {quantity}
                        </Text>

                        <Pressable
                          onPress={() => handleIncrease(item)}
                          className="h-9 w-9 items-center justify-center rounded-full bg-primary"
                        >
                          <Ionicons name="add" size={18} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View className="items-center py-10">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
                <Ionicons name="search-outline" size={26} color="#737373" />
              </View>

              <Text className="mt-4 text-center text-base font-bold text-text">
                No items found
              </Text>

              <Text className="mt-1 text-center text-sm text-textSecondary">
                There are no items available for {selectedSubCategory}.
              </Text>
            </View>
          )
        ) : null}
      </ScrollView>

      {/* -------------------------------------------------- */}
      {/* CART BAR */}
      {/* -------------------------------------------------- */}

      {cartCount > 0 && !isFreeSelectionMode ? (
        <View
          className="absolute bottom-5 left-5 right-5"
          style={{
            paddingBottom: "max(28px, env(safe-area-inset-bottom))" as any,
          }}
        >
          <Pressable
            onPress={() => router.push("/cart")}
            className="flex-row items-center justify-between rounded-2xl bg-primary px-5 py-4"
          >
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                <Text className="text-sm font-bold text-primary">
                  {cartCount}
                </Text>
              </View>

              <Text className="ml-3 text-base font-bold text-white">
                View Cart
              </Text>
            </View>

            <Text className="text-base font-bold text-white">
              GH₵
              {cartTotal.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
