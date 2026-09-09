import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Chicken", emoji: "🍗" },
  { name: "Local", emoji: "🍲" },
  { name: "Drinks", emoji: "🥤" },
];

const restaurants = [
  {
    id: "1",
    name: "Kwayisibea Hotel",
    emoji: "👩‍🍳",
    rating: "4.6",
    reviews: "238",
    time: "20–30 min",
    category: "Local • Ghanaian",
  },
  {
    id: "2",
    name: "Concept",
    emoji: "🍕",
    rating: "4.5",
    reviews: "125",
    time: "25–35 min",
    category: "Pizza • Fast Food",
  },
  {
    id: "3",
    name: "Burger Hub",
    emoji: "🍔",
    rating: "4.4",
    reviews: "210",
    time: "20–30 min",
    category: "Burgers • Fast Food",
  },
];

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        <View className="w-full max-w-[1100px] self-center">
          {/* HEADER */}
          <View className="px-5 pt-20">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="mt-1 text-xl font-bold text-text">
                  Hello, Ama 👋
                </Text>
              </View>

              {/* NOTIFICATION */}
              <TouchableOpacity
                onPress={() => router.push("/notifications")}
                activeOpacity={0.7}
                className="relative h-11 w-11 items-center justify-center rounded-full bg-surface"
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#171717"
                />

                {/* Unread notification indicator */}
                <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
              </TouchableOpacity>
            </View>

            {/* LOCATION */}
            <TouchableOpacity
              onPress={() => router.push("/location")}
              className="mt-2 flex-row items-center"
            >
              <View className="flex-col">
                <Text className="text-xs text-textSecondary">
                  Delivering to
                </Text>

                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold text-text">
                    Akropong, Ghana
                  </Text>

                  <Ionicons name="location" size={18} color="#E53935" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          {/* SEARCH */}
          <Pressable
            onPress={() => router.push("/search")}
            className="mx-5 mt-5 flex-row items-center rounded-xl bg-surface px-4"
          >
            <Ionicons name="search-outline" size={20} color="#737373" />

            <TextInput
              placeholder="Search for food or restaurant"
              placeholderTextColor="#737373"
              editable={false}
              className="ml-3 flex-1 py-3.5 text-sm text-text"
            />

            <Ionicons name="options-outline" size={20} color="#171717" />
          </Pressable>
          {/* PROMO BANNER */}
          <TouchableOpacity className="mx-5 mt-5 overflow-hidden rounded-2xl bg-primary">
            <View className="flex-row items-center px-5 py-5">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-white">
                  SPECIAL OFFER
                </Text>

                <Text className="mt-1 text-2xl font-extrabold text-white">
                  30% OFF
                </Text>

                <Text className="mt-1 text-xs text-white">
                  On your first order
                </Text>

                <View className="mt-3 self-start rounded-lg bg-white px-4 py-2">
                  <Text className="text-xs font-bold text-primary">
                    Order Now
                  </Text>
                </View>
              </View>

              <View className="h-28 w-28 items-center justify-center rounded-full bg-yellow-100">
                <Text className="text-7xl">🍲</Text>
              </View>
            </View>
          </TouchableOpacity>
          {/* DELIVERY ENTRY POINT */}
          <Pressable
            onPress={() => router.push("/delivery-request")}
            className="mx-5 mt-5 flex-row items-center rounded-2xl border border-border bg-white p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Ionicons name="bicycle-outline" size={25} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">Need a delivery?</Text>

              <Text className="mt-1 text-xs leading-5 text-textSecondary">
                Already ordered from a restaurant? Let AkroBite deliver it.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={19} color="#737373" />
          </Pressable>

          {/* CATEGORIES */}
          <View className="mt-7">
            <View className="mb-4 flex-row items-center justify-between px-5">
              <Text className="text-lg font-bold text-text">Categories</Text>

              <TouchableOpacity onPress={() => router.push("/categories")}>
                <Text className="text-sm font-semibold text-primary">
                  See all
                </Text>
              </TouchableOpacity>
            </View>

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
                  {/* CATEGORY ICON */}
                  <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
                    <Text className="text-4xl">{category.emoji}</Text>
                  </View>

                  {/* CATEGORY NAME */}
                  <Text
                    className="mt-2 text-xs font-medium text-text"
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* POPULAR RESTAURANTS */}
          <View className="mt-8">
            {/* HEADER */}
            <View className="mb-4 flex-row items-center justify-between px-5">
              <Text className="text-lg font-bold text-text">
                Popular Restaurants
              </Text>

              <Pressable onPress={() => router.push("/restaurants")}>
                <Text className="text-sm font-semibold text-primary">
                  See all
                </Text>
              </Pressable>
            </View>

            {/* RESTAURANTS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            >
              {restaurants.map((restaurant) => (
                <Pressable
                  key={restaurant.id}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                  className="mr-4 w-56 overflow-hidden rounded-2xl border border-border bg-white"
                >
                  {/* RESTAURANT IMAGE / PLACEHOLDER */}
                  <View className="h-32 items-center justify-center bg-surface">
                    <Text className="text-6xl">{restaurant.emoji}</Text>
                  </View>

                  {/* CONTENT */}
                  <View className="p-3">
                    <Text className="font-bold text-text" numberOfLines={1}>
                      {restaurant.name}
                    </Text>

                    <Text
                      className="mt-1 text-xs text-textSecondary"
                      numberOfLines={1}
                    >
                      {restaurant.category}
                    </Text>

                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="star" size={13} color="#F59E0B" />

                      <Text className="ml-1 text-xs font-semibold text-text">
                        {restaurant.rating}
                      </Text>

                      <Text className="ml-1 text-xs text-textSecondary">
                        ({restaurant.reviews})
                      </Text>

                      <Text className="mx-2 text-xs text-border">•</Text>

                      <Text className="text-xs text-textSecondary">
                        {restaurant.time}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          {/* NEARBY RESTAURANTS */}
          <View className="mt-8 px-5">
            <Text className="mb-4 text-lg font-bold text-text">
              Nearby Restaurants
            </Text>

            <Pressable className="flex-row rounded-2xl border border-border bg-white p-3">
              <View className="h-20 w-20 items-center justify-center rounded-xl bg-orange-100">
                <Text className="text-4xl">🍗</Text>
              </View>

              <View className="ml-3 flex-1 justify-center">
                <Text className="font-bold text-text">Akropong Food Spot</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Local • Ghanaian • Fast Food
                </Text>

                <View className="mt-1 flex-row items-center">
                  <Ionicons name="star" size={13} color="#F59E0B" />

                  <Text className="ml-1 text-xs text-textSecondary">
                    4.5 • 15–25 min
                  </Text>
                </View>
              </View>

              <View className="justify-center">
                <Ionicons name="chevron-forward" size={18} color="#737373" />
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-center">
      <Ionicons name={icon} size={21} color={active ? "#E53935" : "#737373"} />

      <Text
        className={`mt-1 text-[10px] ${
          active ? "font-bold text-primary" : "text-textSecondary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
