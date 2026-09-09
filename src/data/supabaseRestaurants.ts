import type { Restaurant } from "@/components/restaurant/RestaurantCard";
import {
    getRestaurantMenu,
    type MenuCategory,
    type MenuItem,
} from "@/data/restaurantMenus";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
    DatabaseMenuCategory,
    DatabaseMenuItem,
    DatabaseRestaurant,
} from "@/types/database";

const restaurantImages: Record<string, number> = {
  "1": require("../../assets/images/akrobite-logo.png"),
  "2": require("../../assets/images/akrobite-logo.png"),
  "3": require("../../assets/images/akrobite-logo.png"),
  "7": require("../../assets/images/akrobite-logo.png"),
  "8": require("../../assets/images/akrobite-logo.png"),
};

export async function fetchRestaurants(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id,name,image_url,rating,review_count,delivery_minutes,delivery_fee,has_offer,cuisine",
    )
    .eq("is_open", true)
    .order("name");

  if (error) throw error;

  return ((data ?? []) as DatabaseRestaurant[]).map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    image: restaurant.image_url
      ? { uri: restaurant.image_url }
      : (restaurantImages[restaurant.id] ?? restaurantImages["1"]),
    rating: restaurant.rating.toFixed(1),
    reviews: String(restaurant.review_count),
    time: restaurant.delivery_minutes,
    fee: `GH₵${restaurant.delivery_fee}`,
    cuisine: restaurant.cuisine,
    offer: restaurant.has_offer,
  }));
}

export async function fetchRestaurantMenu(
  restaurantId: string,
): Promise<MenuCategory[]> {
  if (!isSupabaseConfigured) {
    return getRestaurantMenu(restaurantId);
  }

  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("id,restaurant_id,name,sort_order")
      .eq("restaurant_id", restaurantId)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select(
        "id,restaurant_id,category_id,name,description,price,image_url,is_available",
      )
      .eq("restaurant_id", restaurantId)
      .eq("is_available", true),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const categories = (categoriesResult.data ?? []) as DatabaseMenuCategory[];
  const items = (itemsResult.data ?? []) as DatabaseMenuItem[];

  if (categories.length === 0) {
    return getRestaurantMenu(restaurantId);
  }

  const localItems = getRestaurantMenu(restaurantId)
    .flatMap((category) => category.items)
    .reduce<Record<string, MenuItem>>((result, item) => {
      result[item.id] = item;
      return result;
    }, {});

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    items: items
      .filter((item) => item.category_id === category.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? undefined,
        price: Number(item.price),
        category: category.name,
        image: item.image_url
          ? { uri: item.image_url }
          : (localItems[item.id]?.image ?? restaurantImages[restaurantId]),
      })),
  }));
}
