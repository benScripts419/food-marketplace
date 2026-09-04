import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";

export default function CartScreen() {
  const {
    cartItems,
    cartTotal,
    cartCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const deliveryFee = cartItems.length > 0 ? 10 : 0;
  const serviceFee = cartItems.length > 0 ? 5 : 0;
  const total = cartTotal + deliveryFee + serviceFee;

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <View className="flex-1 bg-white px-5 pt-14">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={23} color="#171717" />
          </Pressable>

          <Text className="text-xl font-bold text-text">Cart</Text>

          <View className="h-10 w-10" />
        </View>

        <View className="mt-20 items-center">
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

  // RESTAURANT
  const restaurant = cartItems[0];

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <View className="items-center">
          <Text className="text-xl font-bold text-text">Cart</Text>

          <Text className="text-xs text-textSecondary">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </Text>
        </View>

        <Pressable
          onPress={clearCart}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={21} color="#737373" />
        </Pressable>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 180,
        }}
      >
        {/* RESTAURANT */}
        <View className="mb-5 rounded-2xl bg-surface p-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
              <Ionicons name="restaurant-outline" size={22} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">
                {restaurant.restaurantName}
              </Text>

              <Text className="mt-1 text-xs text-textSecondary">
                Your selected items
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#737373" />
          </View>
        </View>

        {/* ITEMS */}
        <Text className="mb-4 text-lg font-bold text-text">Your Items</Text>

        {cartItems.map((item) => (
          <View
            key={`${item.restaurantId}-${item.id}`}
            className="mb-4 rounded-2xl border border-border bg-white p-3"
          >
            <View className="flex-row">
              {/* FOOD IMAGE */}
              <View className="h-20 w-20 overflow-hidden rounded-xl bg-surface">
                <Image
                  source={item.image}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              {/* ITEM DETAILS */}
              <View className="ml-3 flex-1">
                <View className="flex-row items-start">
                  <Text
                    className="mr-2 flex-1 text-sm font-bold text-text"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  {/* DELETE */}
                  <Pressable
                    onPress={() => removeFromCart(item.id, item.restaurantId)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={19} color="#DC2626" />
                  </Pressable>
                </View>

                <Text className="mt-1 text-sm font-bold text-primary">
                  GH₵{item.price.toFixed(2)}
                </Text>

                {/* QUANTITY */}
                <View className="mt-2 flex-row items-center">
                  {/* DECREASE */}
                  <Pressable
                    onPress={() => decreaseQuantity(item.id, item.restaurantId)}
                    className="h-8 w-8 items-center justify-center rounded-lg border border-border"
                  >
                    <Ionicons name="remove" size={16} color="#171717" />
                  </Pressable>

                  {/* QUANTITY */}
                  <Text className="mx-4 min-w-[20px] text-center font-bold text-text">
                    {item.quantity}
                  </Text>

                  {/* INCREASE */}
                  <Pressable
                    onPress={() => increaseQuantity(item.id, item.restaurantId)}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-primary"
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* ADD MORE */}
        <Pressable
          onPress={() => router.back()}
          className="mb-7 flex-row items-center justify-center rounded-xl border border-primary py-3"
        >
          <Ionicons name="add" size={18} color="#E53935" />

          <Text className="ml-2 font-bold text-primary">Add more items</Text>
        </Pressable>

        {/* ORDER SUMMARY */}
        <Text className="mb-4 text-lg font-bold text-text">Order Summary</Text>

        <View className="rounded-2xl bg-surface p-4">
          {/* SUBTOTAL */}
          <View className="flex-row justify-between">
            <Text className="text-sm text-textSecondary">Subtotal</Text>

            <Text className="font-semibold text-text">
              GH₵{cartTotal.toFixed(2)}
            </Text>
          </View>

          {/* DELIVERY */}
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Delivery fee</Text>

            <Text className="font-semibold text-text">
              GH₵{deliveryFee.toFixed(2)}
            </Text>
          </View>

          {/* SERVICE FEE */}
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Service fee</Text>

            <Text className="font-semibold text-text">
              GH₵{serviceFee.toFixed(2)}
            </Text>
          </View>

          <View className="my-4 border-t border-border" />

          {/* TOTAL */}
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text">Total</Text>

            <Text className="text-base font-bold text-primary">
              GH₵{total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CHECKOUT */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={() => router.push("/checkout")}
          className="h-14 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Text className="font-bold text-white">Proceed to Checkout</Text>

          <Text className="ml-3 font-bold text-white">
            GH₵{total.toFixed(2)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
