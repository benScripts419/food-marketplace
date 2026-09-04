import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Restaurant = {
  name: string;
  emoji: string;
  rating: string;
  time: string;
  category: string;
};

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPress?: () => void;
};

export default function RestaurantCard({
  restaurant,
  onPress,
}: RestaurantCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-4 w-48"
      activeOpacity={0.8}
    >
      {/* Image */}
      <View className="relative overflow-hidden rounded-2xl bg-purple-100">
        <View className="h-32 w-full items-center justify-center">
          <Text className="text-6xl">{restaurant.emoji}</Text>
        </View>

        {/* Favorite button */}
        <TouchableOpacity className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white">
          <Ionicons name="heart-outline" size={18} color="#171717" />
        </TouchableOpacity>
      </View>

      {/* Restaurant details */}
      <View className="mt-2">
        <Text className="text-sm font-bold text-text" numberOfLines={1}>
          {restaurant.name}
        </Text>

        <View className="mt-1 flex-row items-center">
          <Ionicons name="star" size={13} color="#F59E0B" />

          <Text className="ml-1 text-xs text-textSecondary">
            {restaurant.rating}
          </Text>

          <Text className="mx-1 text-xs text-textSecondary">•</Text>

          <Text className="text-xs text-textSecondary">{restaurant.time}</Text>
        </View>

        <Text className="mt-1 text-xs text-textSecondary">
          {restaurant.category}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
