import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const foods = {
  "1": {
    id: "1",
    name: "Jollof Rice with Chicken",
    image: require("../../../assets/images/akrobite-logo.png"),
    price: 55,
    description:
      "Delicious Ghanaian jollof rice served with juicy grilled chicken, vegetables and a flavorful sauce.",
    restaurant: "Kwayisibea Hotel",
    category: "Popular",
  },

  "2": {
    id: "2",
    name: "Waakye with Gari",
    image: require("../../../assets/images/akrobite-logo.png"),
    price: 45,
    description:
      "A traditional Ghanaian favorite made with rice and beans, served with gari and tasty sides.",
    restaurant: "Mama's Kitchen",
    category: "Local Dishes",
  },

  "3": {
    id: "3",
    name: "Pepperoni Pizza",
    image: require("../../../assets/images/akrobite-logo.png"),
    price: 65,
    description:
      "Freshly baked pizza topped with mozzarella cheese, rich tomato sauce and pepperoni.",
    restaurant: "Pizzamania",
    category: "Pizza",
  },
};

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const food = foods[id as keyof typeof foods];

  const [quantity, setQuantity] = useState(1);

  if (!food) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-xl font-bold text-text">Food not found</Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const total = food.price * quantity;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        {/* FOOD IMAGE */}

        <View className="relative h-[300px] w-full bg-surface">
          <Image
            source={food.image}
            className="h-full w-full"
            resizeMode="cover"
          />

          {/* BACK BUTTON */}

          <Pressable
            onPress={() => router.back()}
            className="absolute left-5 top-14 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          {/* FAVORITE */}

          <Pressable className="absolute right-5 top-14 h-11 w-11 items-center justify-center rounded-full bg-white">
            <Ionicons name="heart-outline" size={22} color="#171717" />
          </Pressable>
        </View>

        {/* FOOD INFORMATION */}

        <View className="px-5 pt-5">
          {/* NAME */}

          <Text className="text-2xl font-bold text-text">{food.name}</Text>

          {/* RESTAURANT */}

          <Pressable
            onPress={() => router.back()}
            className="mt-2 flex-row items-center"
          >
            <Ionicons name="restaurant-outline" size={15} color="#E53935" />

            <Text className="ml-1 text-sm text-primary">{food.restaurant}</Text>

            <Ionicons
              name="chevron-forward"
              size={14}
              color="#737373"
              style={{
                marginLeft: 3,
              }}
            />
          </Pressable>

          {/* RATING */}

          <View className="mt-3 flex-row items-center">
            <Ionicons name="star" size={16} color="#F59E0B" />

            <Text className="ml-1 font-semibold text-text">4.6</Text>

            <Text className="ml-1 text-sm text-textSecondary">
              (238 reviews)
            </Text>
          </View>

          {/* PRICE */}

          <Text className="mt-4 text-xl font-bold text-primary">
            GH₵{food.price.toFixed(2)}
          </Text>

          {/* DESCRIPTION */}

          <View className="mt-5">
            <Text className="text-lg font-bold text-text">Description</Text>

            <Text className="mt-2 text-sm leading-6 text-textSecondary">
              {food.description}
            </Text>
          </View>

          {/* OPTIONS */}

          <View className="mt-6">
            <Text className="text-lg font-bold text-text">Add extras</Text>

            <Text className="mt-1 text-xs text-textSecondary">Optional</Text>

            {/* EXTRA 1 */}

            <Pressable className="mt-4 flex-row items-center justify-between border-b border-border pb-4">
              <View className="flex-row items-center">
                <View className="h-5 w-5 rounded-md border border-border" />

                <Text className="ml-3 text-sm font-medium text-text">
                  Extra chicken
                </Text>
              </View>

              <Text className="text-sm text-textSecondary">+ GH₵15</Text>
            </Pressable>

            {/* EXTRA 2 */}

            <Pressable className="mt-4 flex-row items-center justify-between border-b border-border pb-4">
              <View className="flex-row items-center">
                <View className="h-5 w-5 rounded-md border border-border" />

                <Text className="ml-3 text-sm font-medium text-text">
                  Extra vegetables
                </Text>
              </View>

              <Text className="text-sm text-textSecondary">+ GH₵5</Text>
            </Pressable>

            {/* EXTRA 3 */}

            <Pressable className="mt-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-5 w-5 rounded-md border border-border" />

                <Text className="ml-3 text-sm font-medium text-text">
                  Extra sauce
                </Text>
              </View>

              <Text className="text-sm text-textSecondary">+ GH₵3</Text>
            </Pressable>
          </View>

          {/* SPECIAL INSTRUCTIONS */}

          <View className="mt-7">
            <Text className="text-lg font-bold text-text">
              Special instructions
            </Text>

            <View className="mt-3 rounded-xl bg-surface p-4">
              <Text className="text-sm text-textSecondary">
                Add a note for the restaurant...
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM CART BAR */}

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <View className="flex-row items-center">
          {/* QUANTITY */}

          <View className="mr-4 flex-row items-center rounded-xl border border-border">
            <Pressable
              onPress={() => setQuantity((value) => Math.max(1, value - 1))}
              className="h-12 w-11 items-center justify-center"
            >
              <Ionicons name="remove" size={20} color="#171717" />
            </Pressable>

            <Text className="w-8 text-center font-bold text-text">
              {quantity}
            </Text>

            <Pressable
              onPress={() => setQuantity((value) => value + 1)}
              className="h-12 w-11 items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#171717" />
            </Pressable>
          </View>

          {/* ADD TO CART */}

          <Pressable
            onPress={() => router.push("/cart")}
            className="h-12 flex-1 flex-row items-center justify-center rounded-xl bg-primary"
          >
            <Text className="font-bold text-white">Add to Cart</Text>

            <Text className="ml-3 font-bold text-white">
              GH₵{total.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
