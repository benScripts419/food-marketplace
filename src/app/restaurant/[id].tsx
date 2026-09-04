import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { getRestaurantMenu } from "@/data/restaurantMenus";

const restaurantNames: Record<string, string> = {
  "1": "Kwayisibea Hotel",
  "7": "Bloom Bakes",
  "8": "Brackers Inn",
};

const restaurantImage = require("../../../assets/images/akrobite-logo.png");

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = Array.isArray(id) ? id[0] : id;
  const menu = restaurantId ? getRestaurantMenu(restaurantId) : [];
  const restaurantName = restaurantId
    ? restaurantNames[restaurantId]
    : undefined;

  if (!restaurantName) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-xl font-bold text-text">
          Restaurant not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative h-[220px] w-full bg-surface">
          <Image
            source={restaurantImage}
            className="h-full w-full"
            resizeMode="cover"
          />
          <Pressable
            onPress={() => router.back()}
            className="absolute left-5 top-14 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>
        </View>

        <View className="px-5 py-5">
          <Text className="text-2xl font-bold text-text">{restaurantName}</Text>
          <Text className="mt-1 text-sm text-textSecondary">
            Local dishes, drinks, and meals
          </Text>

          {menu.length === 0 ? (
            <Text className="mt-8 text-center text-textSecondary">
              No menu items available.
            </Text>
          ) : (
            menu.map((category) => (
              <View key={category.id} className="mt-7">
                <Text className="text-lg font-bold text-text">
                  {category.name}
                </Text>
                {category.items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(`/food/${item.id}`)}
                    className="mt-4 flex-row border-b border-border pb-4"
                  >
                    <Image
                      source={item.image}
                      className="h-20 w-20 rounded-xl"
                      resizeMode="cover"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-text">{item.name}</Text>
                      {item.description ? (
                        <Text
                          className="mt-1 text-sm text-textSecondary"
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      ) : null}
                      <Text className="mt-2 font-bold text-primary">
                        GH₵{item.price.toFixed(2)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
