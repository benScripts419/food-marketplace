import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";

export default function CartScreen() {
  const {
    cartItems,
    cartTotal,
    cartCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 bg-white px-5 pt-6">
        <Text className="text-2xl font-bold text-text">Your Cart</Text>

        <View className="mt-10 items-center">
          <Text className="text-5xl">🛒</Text>

          <Text className="mt-4 text-lg font-bold text-text">
            Your cart is empty
          </Text>

          <Text className="mt-2 text-center text-sm text-textSecondary">
            Add some delicious food from a restaurant.
          </Text>

          <Pressable
            onPress={() => router.push("/restaurants")}
            className="mt-6 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-bold text-white">Browse Restaurants</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-3 pt-6">
        <Text className="text-2xl font-bold text-text">Your Cart</Text>

        <Text className="mt-1 text-sm text-textSecondary">
          {cartCount} {cartCount === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* CART ITEMS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 220,
        }}
      >
        {/* RESTAURANT */}
        <View className="mb-5 rounded-xl bg-surface px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="restaurant-outline" size={20} color="#E53935" />

            <Text className="ml-2 text-sm font-bold text-text">
              {cartItems[0].restaurantName}
            </Text>
          </View>
        </View>

        {cartItems.map((item) => (
          <View
            key={`${item.restaurantId}-${item.id}`}
            className="mb-5 flex-row border-b border-border pb-5"
          >
            {/* ITEM IMAGE */}
            <View className="h-24 w-24 overflow-hidden rounded-xl bg-surface">
              <View className="h-full w-full items-center justify-center">
                <Ionicons name="restaurant-outline" size={30} color="#737373" />
              </View>
            </View>

            {/* ITEM DETAILS */}
            <View className="ml-3 flex-1">
              <View className="flex-row items-start justify-between">
                <Text
                  className="mr-2 flex-1 text-base font-bold text-text"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Pressable
                  onPress={() => removeFromCart(item.id, item.restaurantId)}
                >
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </Pressable>
              </View>

              {item.description && (
                <Text
                  className="mt-1 text-xs text-textSecondary"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}

              <Text className="mt-2 text-sm font-bold text-primary">
                GH₵{item.price.toFixed(2)}
              </Text>

              {/* QUANTITY */}
              <View className="mt-3 flex-row items-center">
                <Pressable
                  onPress={() => decreaseQuantity(item.id, item.restaurantId)}
                  className="h-8 w-8 items-center justify-center rounded-full border border-border"
                >
                  <Ionicons name="remove" size={16} color="#171717" />
                </Pressable>

                <Text className="mx-4 min-w-[20px] text-center text-sm font-bold text-text">
                  {item.quantity}
                </Text>

                <Pressable
                  onPress={() => increaseQuantity(item.id, item.restaurantId)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-primary"
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {/* TOTAL */}
        <View className="mt-2">
          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-textSecondary">Subtotal</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{cartTotal.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-textSecondary">Delivery fee</Text>

            <Text className="text-sm font-semibold text-text">
              Calculated at checkout
            </Text>
          </View>

          <View className="mt-2 flex-row justify-between border-t border-border pt-4">
            <Text className="text-lg font-bold text-text">Total</Text>

            <Text className="text-lg font-bold text-primary">
              GH₵{cartTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CHECKOUT BUTTON */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={() => router.push("/checkout")}
          className="h-14 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Text className="font-bold text-white">Proceed to Checkout</Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
