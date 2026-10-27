const categoryImages: Record<string, any> = {
  pizza: require("@/assets/images/food/pizza-cat.jpg"),
  burger: require("@/assets/images/food/burger-with-fries.jpg"),
  burgers: require("@/assets/images/food/burger-with-fries.jpg"),
  chicken: require("@/assets/images/food/matcha-cat.jpg"),
  local: require("@/assets/images/food/local-cat.png"),
  african: require("@/assets/images/food/matcha-cat.jpg"),
  drinks: require("@/assets/images/food/matcha-cat.jpg"),
  drink: require("@/assets/images/food/matcha-cat.jpg"),
  shawarma: require("@/assets/images/food/shawarma-cat.jpg"),
  sushi: require("@/assets/images/food/matcha-cat.jpg"),
  japanese: require("@/assets/images/food/matcha-cat.jpg"),
  bakery: require("@/assets/images/food/matcha-cat.jpg"),
  breakfast: require("@/assets/images/food/breakfast.jpg"),
  fastfood: require("@/assets/images/food/matcha-cat.jpg"),
  "fast food": require("@/assets/images/food/fastfood-cat.jpg"),
  grill: require("@/assets/images/food/grills-cat.jpg"),
  grills: require("@/assets/images/food/grills-cat.jpg"),
  tea: require("@/assets/images/food/boba-tea.jpg"),
  matcha: require("@/assets/images/food/matcha-cat.jpg"),
  assorted: require("@/assets/images/food/assorted-fried-rice.jpg"),
  "main dishes": require("@/assets/images/food/main-cat.jpg"),
  poultry: require("@/assets/images/food/poultry.jpg"),
  "pastas & noodles": require("@/assets/images/food/pasta-and-noodles.jpg"),
  "side orders": require("@/assets/images/food/sides.jpg"),
  snacks: require("@/assets/images/food/snacks.jpg"),
  "sea foods": require("@/assets/images/food/seafoods.jpg"),
  sandwich: require("@/assets/images/food/sandwich-cat.jpg"),
  specials: require("@/assets/images/food/specials.jpg"),
  vegetarian: require("@/assets/images/food/vegetarian.jpg"),
      starters: require("@/assets/images/food/starters.jpg"),
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
