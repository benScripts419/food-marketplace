import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";

const ROLLD_UP_RESTAURANT_ID = "0a7aae53-94c5-428c-88c5-3e6cd88ee911";

export default function CartScreen() {
  const {
    cartItems,
    cartTotal,
    cartSubtotal,
    promotionDiscount,
    isPromotionActive,
    pendingFreeItemSelection,
    freeItemSelections,
    cartCount,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const insets = useSafeAreaInsets();
  const tabOffset = Platform.OS === "web" ? 0 : 64 + 14 + insets.bottom;

  // Space taken by the floating tab bar (it's hidden on web)

  // The delivery fee is not worked out here any more: it depends on the
  // customer's location, so checkout calculates it.

  /*
   * --------------------------------------------------
   * GET FREE QUANTITY FOR AN ITEM
   * --------------------------------------------------
   */
  const getFreeQuantity = (itemId: string, restaurantId: string) => {
    return freeItemSelections.filter(
      (selection) =>
        selection.itemId === itemId && selection.restaurantId === restaurantId,
    ).length;
  };

  /*
   * --------------------------------------------------
   * CHECK WHETHER ITEM BELONGS TO ROLL'D UP
   * --------------------------------------------------
   */
  const isRollDUpItem = (restaurantId: string) => {
    return restaurantId === ROLLD_UP_RESTAURANT_ID;
  };

  /*
   * --------------------------------------------------
   * EMPTY CART
   * --------------------------------------------------
   */
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

  /*
   * --------------------------------------------------
   * CART
   * --------------------------------------------------
   */
  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-3 pt-6">
        <Text className="text-2xl font-bold text-text">Your Cart</Text>

        <Text className="mt-1 text-sm text-textSecondary">
          {cartCount} {cartCount === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* CART CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
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

        {/* --------------------------------------------------
            FREE ITEM SELECTION REQUIRED
        -------------------------------------------------- */}
        {isPromotionActive && pendingFreeItemSelection && (
          <View className="mb-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50">
            <View className="px-4 py-4">
              <View className="flex-row items-start">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xl">🎁</Text>
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-sm font-extrabold text-primary">
                    You've unlocked a FREE item!
                  </Text>

                  <Text className="mt-1 text-xs leading-5 text-textSecondary">
                    You've qualified for a free Roll'd Up item. Choose the item
                    you want for FREE.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  router.push(`/restaurant/${ROLLD_UP_RESTAURANT_ID}`)
                }
                className="mt-4 h-11 items-center justify-center rounded-xl bg-primary"
              >
                <Text className="text-sm font-bold text-white">
                  Choose FREE Item
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* --------------------------------------------------
            PROMOTION APPLIED
        -------------------------------------------------- */}
        {isPromotionActive &&
          !pendingFreeItemSelection &&
          promotionDiscount > 0 && (
            <View className="mb-5 overflow-hidden rounded-2xl bg-red-50">
              <View className="flex-row items-center px-4 py-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xl">🎉</Text>
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-sm font-extrabold text-primary">
                    Roll'd Up Wednesday
                  </Text>

                  <Text className="mt-1 text-xs leading-5 text-textSecondary">
                    Your free item has been applied to your order.
                  </Text>
                </View>

                <Text className="ml-2 text-sm font-extrabold text-success">
                  -GH₵{promotionDiscount.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

        {/* --------------------------------------------------
            CART ITEMS
        -------------------------------------------------- */}
        {cartItems.map((item) => {
          const freeQuantity = getFreeQuantity(item.id, item.restaurantId);

          const paidQuantity = Math.max(0, item.quantity - freeQuantity);

          const isFreeItem = freeQuantity > 0;

          const belongsToRollDUp = isRollDUpItem(item.restaurantId);

          return (
            <View
              key={`${item.restaurantId}-${item.id}`}
              className="mb-5 flex-row border-b border-border pb-5"
            >
              {/* ITEM IMAGE */}
              <View className="h-24 w-24 overflow-hidden rounded-xl bg-surface">
                <View className="h-full w-full items-center justify-center">
                  <Ionicons
                    name="restaurant-outline"
                    size={30}
                    color="#737373"
                  />
                </View>
              </View>

              {/* ITEM DETAILS */}
              <View className="ml-3 flex-1">
                {/* NAME + DELETE */}
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

                {/* DESCRIPTION */}
                {item.description && (
                  <Text
                    className="mt-1 text-xs text-textSecondary"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                )}

                {/* PRICE + FREE LABEL */}
                <View className="mt-2 flex-row items-center">
                  {paidQuantity > 0 && (
                    <Text className="text-sm font-bold text-primary">
                      GH₵{item.price.toFixed(2)}
                    </Text>
                  )}

                  {isFreeItem && (
                    <View className="ml-2 rounded-md bg-green-100 px-2 py-1">
                      <Text className="text-[10px] font-extrabold text-success">
                        {freeQuantity > 1 ? `${freeQuantity} FREE` : "FREE"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* FREE ITEM DETAILS */}
                {isFreeItem && (
                  <View className="mt-2">
                    {paidQuantity > 0 && (
                      <Text className="text-xs text-textSecondary">
                        {paidQuantity} paid
                        {freeQuantity > 0 ? ` • ${freeQuantity} free` : ""}
                      </Text>
                    )}

                    {paidQuantity === 0 && (
                      <Text className="text-xs font-semibold text-success">
                        This item is FREE
                      </Text>
                    )}
                  </View>
                )}

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

                {/* ROLL'D UP PROMOTION NOTE */}
                {belongsToRollDUp &&
                  isPromotionActive &&
                  paidQuantity > 0 &&
                  !isFreeItem && (
                    <Text className="mt-2 text-[10px] font-medium text-textSecondary">
                      Buy 3 and choose 1 free
                    </Text>
                  )}
              </View>
            </View>
          );
        })}

        {/* --------------------------------------------------
            ORDER SUMMARY
        -------------------------------------------------- */}
        <View className="mt-2">
          {/* SUBTOTAL */}
          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-textSecondary">Subtotal</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{cartSubtotal.toFixed(2)}
            </Text>
          </View>

          {/* PROMOTION DISCOUNT */}
          {promotionDiscount > 0 && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm font-semibold text-success">
                Roll'd Up Wednesday
              </Text>

              <Text className="text-sm font-bold text-success">
                -GH₵{promotionDiscount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* DELIVERY */}
          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-textSecondary">Delivery fee</Text>

            <Text className="text-sm font-semibold text-text">
              Calculated at checkout
            </Text>
          </View>

          {/* TOTAL */}
          <View className="mt-2 flex-row justify-between border-t border-border pt-4">
            <View>
              <Text className="text-lg font-bold text-text">Food Total</Text>

              {promotionDiscount > 0 && (
                <Text className="mt-1 text-xs text-success">
                  You saved GH₵
                  {promotionDiscount.toFixed(2)}
                </Text>
              )}
            </View>

            <Text className="text-lg font-bold text-primary">
              GH₵{cartTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CHECKOUT (sits just above the floating tab bar) */}
      <View
        className="bg-white px-5 pt-3"
        style={{
          marginBottom: tabOffset ? tabOffset + 8 : 0,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={() => router.push("/checkout")}
          className="h-14 items-center justify-center rounded-xl bg-primary"
        >
          <Text className="font-bold text-white">Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}
