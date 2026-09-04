import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import RestaurantCard, {
  type Restaurant,
} from "../../components/restaurant/RestaurantCard";

const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Kwayisibea Hotel",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.6",
    reviews: "238",
    time: "20–30 min",
    fee: "GH₵10",
    cuisine: "Local • African • Grills",
    offer: true,
  },
  {
    id: "2",
    name: "Concept",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.5",
    reviews: "125",
    time: "25–35 min",
    fee: "GH₵15",
    cuisine: "Pizza • Fast Food",
    offer: false,
  },
  {
    id: "3",
    name: "Roll'd",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.4",
    reviews: "210",
    time: "20–30 min",
    fee: "GH₵8",
    cuisine: "Shawarma",
    offer: true,
  },
  {
    id: "7",
    name: "Bloom Bakes",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.3",
    reviews: "164",
    time: "30–40 min",
    fee: "GH₵12",
    cuisine: "Chicken • Grills",
    offer: false,
  },
  {
    id: "8",
    name: "Brackers Inn",
    image: require("../../../assets/images/akrobite-logo.png"),
    rating: "4.7",
    reviews: "96",
    time: "30–40 min",
    fee: "GH₵15",
    cuisine: "Sushi • Japanese",
    offer: false,
  },
];

const filters = ["All", "Offers", "Delivery Time", "Rating"];

export default function RestaurantsScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pt-16">
        <View className="flex-row items-center justify-between">
          {/* BACK */}
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={23} color="#171717" />
          </Pressable>

          {/* FILTER */}
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="options-outline" size={22} color="#171717" />
          </Pressable>
        </View>

        {/* TITLE */}
        <View className="mt-4">
          <Text className="text-2xl font-bold text-text">Restaurants</Text>

          <Pressable
            onPress={() => router.push("/location")}
            className="mt-1 flex-row items-center"
          >
            <Ionicons name="location-outline" size={14} color="#E53935" />

            <Text className="ml-1 text-sm font-medium text-text">
              Akropong, Ghana
            </Text>

            <Ionicons
              name="chevron-down"
              size={14}
              color="#737373"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>
      </View>

      {/* FILTERS */}
      <View className="mt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 4,
          }}
        >
          {filters.map((filter, index) => (
            <Pressable
              key={filter}
              className={`mr-2 mb-5 min-h-[30px] items-center justify-center rounded-lg border px-5 ${
                index === 0
                  ? "border-primary bg-primary"
                  : "border-border bg-white"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  index === 0 ? "text-white" : "text-text"
                }`}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* RESTAURANTS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110,
        }}
      >
        <Text className="mb-3 text-sm text-textSecondary">
          {restaurants.length} restaurants found
        </Text>

        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function BottomNavigation() {
  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-4 pb-7 pt-3">
      <NavItem
        icon="home-outline"
        label="Home"
        onPress={() => router.push("/")}
      />

      <NavItem
        icon="search-outline"
        label="Search"
        onPress={() => router.push("/search")}
      />

      <NavItem
        icon="receipt-outline"
        label="Orders"
        onPress={() => router.push("/orders")}
      />

      <NavItem
        icon="cart-outline"
        label="Cart"
        onPress={() => router.push("/cart")}
      />

      <NavItem
        icon="person-outline"
        label="Profile"
        onPress={() => router.push("/profile")}
      />
    </View>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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
