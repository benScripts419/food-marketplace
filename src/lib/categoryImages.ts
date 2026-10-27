import type { ImageSourcePropType } from "react-native";

/**
 * Static local category images.
 * Keep these require() paths literal so Metro can bundle them for web and native.
 */
const categoryImages: Record<string, ImageSourcePropType> = {
  pizza: require("@/assets/images/food/pizza-cat.jpg"),

  burger: require("@/assets/images/food/burger-with-fries.jpg"),
  burgers: require("@/assets/images/food/burger-with-fries.jpg"),

  chicken: require("@/assets/images/food/matcha-cat.jpg"),
  poultry: require("@/assets/images/food/poultry.jpg"),
  local: require("@/assets/images/food/local-cat.png"),
  african: require("@/assets/images/food/matcha-cat.jpg"),

  drink: require("@/assets/images/food/matcha-cat.jpg"),
  drinks: require("@/assets/images/food/matcha-cat.jpg"),
  tea: require("@/assets/images/food/boba-tea.jpg"),
  "boba tea": require("@/assets/images/food/boba-tea.jpg"),
  "bubble tea": require("@/assets/images/food/boba-tea.jpg"),
  matcha: require("@/assets/images/food/matcha-cat.jpg"),

  shawarma: require("@/assets/images/food/shawarma-cat.jpg"),
  sushi: require("@/assets/images/food/matcha-cat.jpg"),
  japanese: require("@/assets/images/food/matcha-cat.jpg"),
  bakery: require("@/assets/images/food/matcha-cat.jpg"),
  breakfast: require("@/assets/images/food/breakfast.jpg"),

  fastfood: require("@/assets/images/food/matcha-cat.jpg"),
  "fast food": require("@/assets/images/food/fastfood-cat.jpg"),

  grill: require("@/assets/images/food/grills-cat.jpg"),
  grills: require("@/assets/images/food/grills-cat.jpg"),

  assorted: require("@/assets/images/food/assorted-fried-rice.jpg"),
  "main dishes": require("@/assets/images/food/main-cat.jpg"),
  "pastas & noodles": require("@/assets/images/food/pasta-and-noodles.jpg"),
  "side orders": require("@/assets/images/food/sides.jpg"),
  snacks: require("@/assets/images/food/snacks.jpg"),
  "sea foods": require("@/assets/images/food/seafoods.jpg"),
  seafood: require("@/assets/images/food/seafoods.jpg"),
  sandwich: require("@/assets/images/food/sandwich-cat.jpg"),
  specials: require("@/assets/images/food/specials.jpg"),
  vegetarian: require("@/assets/images/food/vegetarian.jpg"),
  starters: require("@/assets/images/food/starters.jpg"),
};

const normalizeCategory = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[•/|_-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizedEntries = Object.entries(categoryImages)
  .map(([key, image]) => [normalizeCategory(key), image] as const)
  // Match the most specific categories first, e.g. "bubble tea" before "tea".
  .sort(([a], [b]) => b.length - a.length);

const normalizedImages = new Map<string, ImageSourcePropType>(normalizedEntries);

const DEFAULT_CATEGORY_IMAGE = require("@/assets/images/food/local-cat.png") as ImageSourcePropType;

/** Return a bundled image for a category or a safe local fallback. */
export const getCategoryImage = (
  category: string | null | undefined,
): ImageSourcePropType => {
  if (!category?.trim()) return DEFAULT_CATEGORY_IMAGE;

  const normalized = normalizeCategory(category);
  const exact = normalizedImages.get(normalized);
  if (exact) return exact;

  // Match combined labels such as "Pizza • Fast Food".
  for (const [key, image] of normalizedEntries) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return image;
    }
  }

  return DEFAULT_CATEGORY_IMAGE;
};

/** Prefer a restaurant's remote image, otherwise use a local category image. */
export const getRestaurantImage = (restaurant: {
  image_url: string | null;
  category: string | null;
  cuisine: string | null;
}): ImageSourcePropType => {
  const imageUrl = restaurant.image_url?.trim();

  if (imageUrl) {
    return { uri: imageUrl };
  }

  return getCategoryImage(restaurant.category || restaurant.cuisine);
};
