import type { Restaurant } from "@/components/restaurant/RestaurantCard";
import { getRestaurantImage } from "@/lib/categoryImages";

export type RestaurantRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cuisine: string | null;
  category: string | null;
};

const displayData: Record<
  string,
  Pick<Restaurant, "rating" | "reviews" | "time" | "fee" | "offer">
> = {
  "Kwayisibea Hotel": {
    rating: "4.6",
    reviews: "238",
    time: "20–30 min",
    fee: "GH₵10",
    offer: true,
  },
  Concept: {
    rating: "4.5",
    reviews: "125",
    time: "25–35 min",
    fee: "GH₵15",
    offer: false,
  },
  "Brackers Inn": {
    rating: "4.5",
    reviews: "0",
    time: "20–30 min",
    fee: "GH₵0",
    offer: false,
  },
  "Bloom Bakes": {
    rating: "4.5",
    reviews: "0",
    time: "15–25 min",
    fee: "GH₵0",
    offer: false,
  },
  "Roll'd Up Shawarma": {
    rating: "4.4",
    reviews: "210",
    time: "20–30 min",
    fee: "GH₵8",
    offer: true,
  },
  "Boba Buzz": {
    rating: "4.5",
    reviews: "0",
    time: "15–25 min",
    fee: "GH₵0",
    offer: false,
  },
  "Thebloom Boba Tea": {
    rating: "4.5",
    reviews: "0",
    time: "15–25 min",
    fee: "GH₵0",
    offer: false,
  },
};

export function mapRestaurantRow(row: RestaurantRow): Restaurant {
  const display = displayData[row.name];

  return {
    id: row.id,
    name: row.name,
    image:
      getRestaurantImage(row) ?? require("@/assets/images/akrobite-logo.png"),
    rating: display?.rating ?? "0.0",
    reviews: display?.reviews ?? "0",
    time: display?.time ?? "20–30 min",
    fee: display?.fee ?? "GH₵0",
    cuisine: row.cuisine || row.category || "Food & Drinks",
    offer: display?.offer ?? false,
  };
}
