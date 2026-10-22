const categoryImages: Record<string, any> = {
  pizza: require("@/assets/images/food/pizza-cat.jpg"),
  burger: require("@/assets/images/food/matcha-cat.jpg"),
  burgers: require("@/assets/images/food/matcha-cat.jpg"),
  chicken: require("@/assets/images/food/matcha-cat.jpg"),
  local: require("@/assets/images/food/local-cat.png"),
  african: require("@/assets/images/food/matcha-cat.jpg"),
  drinks: require("@/assets/images/food/matcha-cat.jpg"),
  drink: require("@/assets/images/food/matcha-cat.jpg"),
  shawarma: require("@/assets/images/food/shawarma-cat.jpg"),
  sushi: require("@/assets/images/food/matcha-cat.jpg"),
  japanese: require("@/assets/images/food/matcha-cat.jpg"),
  bakery: require("@/assets/images/food/matcha-cat.jpg"),
  breakfast: require("@/assets/images/food/matcha-cat.jpg"),
  fastfood: require("@/assets/images/food/matcha-cat.jpg"),
  "fast food": require("@/assets/images/food/fastfood-cat.jpg"),
  grill: require("@/assets/images/food/grills-cat.jpg"),
  grills: require("@/assets/images/food/grills-cat.jpg"),
  tea: require("@/assets/images/food/matcha-cat.jpg"),
  boba: require("@/assets/images/food/matcha-cat.jpg"),
};

export const getCategoryImage = (category: string) => {
  const normalized = category.trim().toLowerCase();

  if (categoryImages[normalized]) {
    return categoryImages[normalized];
  }

  const match = Object.entries(categoryImages).find(([key]) =>
    normalized.includes(key),
  );

  return match?.[1] ?? null;
};

export const getRestaurantImage = (restaurant: {
  image_url: string | null;
  category: string | null;
  cuisine: string | null;
}) => {
  if (restaurant.image_url) {
    return { uri: restaurant.image_url };
  }

  return getCategoryImage(restaurant.category || restaurant.cuisine || "");
};
