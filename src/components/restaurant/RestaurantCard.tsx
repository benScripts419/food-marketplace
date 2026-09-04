import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

export type Restaurant = {
  id: string;
  name: string;
  image: any;
  rating: string;
  reviews: string;
  time: string;
  fee: string;
  cuisine: string;
  offer: boolean;
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
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row rounded-2xl border border-border bg-white p-2"
    >
      {/* IMAGE */}
      <View className="relative">
        <Image
          source={restaurant.image}
          className="h-[105px] w-[105px] rounded-xl"
          resizeMode="cover"
        />

        {restaurant.offer && (
          <View className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1">
            <Text className="text-[9px] font-bold text-white">OFFER</Text>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View className="ml-3 flex-1 py-1">
        {/* NAME + FAVORITE */}
        <View className="flex-row items-start justify-between">
          <Text
            className="mr-2 flex-1 text-base font-bold text-text"
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>

          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="h-7 w-7 items-center justify-center"
          >
            <Ionicons name="heart-outline" size={19} color="#737373" />
          </Pressable>
        </View>

        {/* RATING */}
        <View className="mt-1 flex-row items-center">
          <Ionicons name="star" size={13} color="#F59E0B" />

          <Text className="ml-1 text-xs font-semibold text-text">
            {restaurant.rating}
          </Text>

          <Text className="ml-1 text-xs text-textSecondary">
            ({restaurant.reviews})
          </Text>
        </View>

        {/* DELIVERY */}
        <View className="mt-2 flex-row items-center">
          <Ionicons name="time-outline" size={13} color="#737373" />

          <Text className="ml-1 text-xs text-textSecondary">
            {restaurant.time}
          </Text>

          <Text className="mx-2 text-xs text-border">•</Text>

          <Text className="text-xs text-textSecondary">
            {restaurant.fee} delivery
          </Text>
        </View>

        {/* CUISINE */}
        <Text className="mt-2 text-xs text-textSecondary" numberOfLines={1}>
          {restaurant.cuisine}
        </Text>
      </View>
    </Pressable>
  );
}
