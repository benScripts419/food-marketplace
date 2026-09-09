import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  getRestaurantMenu,
  type MenuItem as RestaurantMenuItem,
} from "@/data/restaurantMenus";

import { useCart } from "@/context/CartContext";
import { restaurants } from "@/data/restaurants";

export default function RestaurantDetailScreen() {
  const { id, itemId } = useLocalSearchParams<{
    id: string;
    itemId?: string;
  }>();

  const { width } = useWindowDimensions();

  const { addToCart, cartItems, cartTotal, cartCount } = useCart();

  // ScrollView reference
  const scrollViewRef = useRef<ScrollView>(null);

  // Stores the Y position of every menu item
  const itemPositions = useRef<Record<string, number>>({});

  const restaurant = restaurants.find((item) => String(item.id) === String(id));

  const menu = getRestaurantMenu(String(id));

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    menu[0]?.id ?? null,
  );

  /*
   * If we came from the category page with an itemId,
   * find the category containing that item.
   */
  useEffect(() => {
    if (!itemId) return;

    const targetCategory = menu.find((category) =>
      category.items.some((item) => item.id === itemId),
    );

    if (targetCategory) {
      setSelectedCategory(targetCategory.id);
    }
  }, [id, itemId]);

  /*
   * After the correct category has rendered,
   * scroll directly to the selected item.
   */
  useEffect(() => {
    if (!itemId) return;

    const timer = setTimeout(() => {
      const y = itemPositions.current[itemId];

      if (y !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 20),
          animated: true,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [itemId, selectedCategory]);

  /*
   * Restaurant doesn't exist
   */
  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-bold text-text">
          Restaurant not found
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-xl bg-primary px-5 py-3"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  /*
   * From this point TypeScript knows restaurant exists.
   */
  const restaurantId = String(restaurant.id);

  const selectedMenu = menu.find(
    (category) => category.id === selectedCategory,
  );

  const getItemQuantity = (menuItemId: string) => {
    const item = cartItems.find(
      (cartItem) =>
        cartItem.id === menuItemId && cartItem.restaurantId === restaurantId,
    );

    return item?.quantity ?? 0;
  };

  const handleAddToCart = (item: RestaurantMenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      restaurantId,
      restaurantName: restaurant.name,
    });
  };

  const isSmallPhone = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 32 : isSmallPhone ? 16 : 20;

  const heroHeight = isTablet
    ? 420
    : Math.min(Math.max(width * 0.68, 240), 360);

  const foodImageSize = isSmallPhone ? 76 : isTablet ? 110 : 88;

  return (
    <View className="flex-1 bg-white">
      {/* HERO */}
      <View
        style={{
          width: "100%",
          height: heroHeight,
        }}
        className="relative overflow-hidden bg-surface"
      >
        <Image
          source={restaurant.image}
          resizeMode="cover"
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        <View pointerEvents="none" className="absolute inset-0 bg-black/10" />

        {/* BACK BUTTON */}
        <Pressable
          onPress={() => router.back()}
          className="absolute left-5 top-14 h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: {
              width: 0,
              height: 3,
            },
          }}
        >
          <Ionicons name="arrow-back" size={29} color="#171717" />
        </Pressable>

        {/* FAVORITE */}
        <Pressable
          className="absolute right-5 top-14 h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: {
              width: 0,
              height: 3,
            },
          }}
        >
          <Ionicons name="heart-outline" size={30} color="#171717" />
        </Pressable>
      </View>

      {/* FILTER BUTTONS */}
      <View
        className="bg-white"
        style={{
          zIndex: 10,
          elevation: 5,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingVertical: 20,
          }}
        >
          {menu.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-2.5 rounded-xl border px-5 py-3 ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border bg-white"
                }`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? "text-white" : "text-text"
                  }`}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* MENU */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        directionalLockEnabled
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: cartCount > 0 ? 120 : 30,
        }}
      >
        {selectedMenu ? (
          <View className="pt-5">
            {/* CATEGORY HEADER */}
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                className="flex-1 text-2xl font-bold text-text"
                numberOfLines={1}
              >
                {selectedMenu.name}
              </Text>

              <Text className="ml-3 text-base font-bold text-primary">
                {selectedMenu.items.length}{" "}
                {selectedMenu.items.length === 1 ? "item" : "items"}
              </Text>
            </View>

            {/* ITEMS */}
            {selectedMenu.items.map((item) => {
              const quantity = getItemQuantity(item.id);

              const isRequestedItem = itemId === item.id;

              return (
                <View
                  key={item.id}
                  onLayout={(event) => {
                    itemPositions.current[item.id] = event.nativeEvent.layout.y;
                  }}
                  className={`mb-2 flex-row rounded-xl border py-4 ${
                    isRequestedItem
                      ? "border-primary bg-red-50"
                      : "border-border bg-white"
                  }`}
                >
                  {/* FOOD IMAGE */}
                  <Image
                    source={item.image}
                    resizeMode="cover"
                    style={{
                      width: foodImageSize,
                      height: foodImageSize,
                      borderRadius: foodImageSize / 2,
                      marginLeft: 12,
                    }}
                  />

                  {/* DETAILS */}
                  <View className="min-w-0 flex-1 px-3">
                    <Text
                      className="text-lg font-bold text-text"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text
                      className="mt-1 text-sm leading-5 text-textSecondary"
                      numberOfLines={3}
                    >
                      {item.description}
                    </Text>

                    <Text className="mt-2 text-base font-bold text-primary">
                      GH₵{item.price.toFixed(2)}
                    </Text>
                  </View>

                  {/* ADD BUTTON */}
                  <View className="items-center justify-center px-2">
                    <Pressable
                      onPress={() => handleAddToCart(item)}
                      className="h-6 w-6 items-center justify-center rounded-full bg-primary"
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                      })}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </Pressable>

                    {/* QUANTITY */}
                    {quantity > 0 && (
                      <View className="absolute -right-1 -top-1 h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-text px-1">
                        <Text className="text-xs font-bold text-white">
                          {quantity}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="items-center py-10">
            <Text className="text-textSecondary">No menu items available.</Text>
          </View>
        )}
      </ScrollView>

      {/* CART BUTTON */}
      {cartCount > 0 && (
        <View
          className="absolute bottom-5 left-0 right-0 px-4"
          style={{
            zIndex: 20,
            elevation: 10,
          }}
        >
          <Pressable
            onPress={() => router.push("/cart")}
            className="h-16 flex-row items-center justify-between rounded-2xl bg-primary px-5"
          >
            <View className="flex-row items-center">
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white">
                <Text className="font-bold text-primary">{cartCount}</Text>
              </View>

              <Text className="text-base font-bold text-white">View cart</Text>
            </View>

            <Text className="text-base font-bold text-white">
              GH₵{cartTotal.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
