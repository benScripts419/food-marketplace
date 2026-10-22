import { createClient } from "@supabase/supabase-js";

import type { MenuCategory } from "../src/data/restaurantMenus";

// Menu modules require images for the app, but the seed only needs their data.
type AssetModule = { exports: unknown };
const requireWithExtensions = require as typeof require & {
  extensions: Record<string, (module: AssetModule) => void>;
};

for (const extension of [".jpg", ".jpeg", ".png", ".JPEG"]) {
  requireWithExtensions.extensions[extension] = (module) => {
    module.exports = null;
  };
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  const [
    { fiftyCentMenu },
    { bloomBakesMenu },
    { brackersInnMenu },
    { conceptMenu },
    { kwayisibeaMenu },
    { lizjaysMenu },
    { rolldUpMenu },
  ] = await Promise.all([
    import("../src/data/50centMenu"),
    import("../src/data/bloomBakesMenu"),
    import("../src/data/brackersInnMenu"),
    import("../src/data/conceptMenu"),
    import("../src/data/kwayisibeaMenu"),
    import("../src/data/lizjaysMenu"),
    import("../src/data/rolldUpMenu"),
  ]);
  const menus: { aliases: string[]; categories: MenuCategory[] }[] = [
    { aliases: ["Kwayisibea Hotel"], categories: kwayisibeaMenu },
    { aliases: ["Concept"], categories: conceptMenu },
    { aliases: ["Brackers Inn"], categories: brackersInnMenu },
    { aliases: ["Bloom Bakes"], categories: bloomBakesMenu },
    { aliases: ["Roll'd Up Shawarma"], categories: rolldUpMenu },
    {
      aliases: ["Lizjay's Eatery", "Boba Buzz"],
      categories: lizjaysMenu,
    },
    { aliases: ["50 Cent", "Thebloom Boba Tea"], categories: fiftyCentMenu },
  ];

  const restaurantNames = menus.flatMap((menu) => menu.aliases);
  const { data: restaurantRows, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name")
    .in("name", restaurantNames);

  if (restaurantError) throw restaurantError;

  const restaurantByName = new Map(
    (restaurantRows ?? []).map((restaurant) => [restaurant.name, restaurant]),
  );

  const missingRestaurants = menus.filter(
    ({ aliases }) =>
      !aliases.some((name) => restaurantByName.has(name)),
  );
  if (missingRestaurants.length > 0) {
    throw new Error(
      `Missing Supabase restaurants: ${missingRestaurants
        .map(({ aliases }) => aliases.join(" / "))
        .join(", ")}.`,
    );
  }

  for (const { aliases, categories } of menus) {
    const restaurant = aliases
      .map((name) => restaurantByName.get(name))
      .find((row) => row !== undefined);

    if (!restaurant) throw new Error("Restaurant lookup unexpectedly failed.");

    const categoryRows = categories.map((category, sortOrder) => ({
      id: `${restaurant.id}-${category.id}`,
      restaurant_id: restaurant.id,
      name: category.name,
      sort_order: sortOrder,
    }));

    const { error: categoryError } = await supabase
      .from("menu_categories")
      .upsert(categoryRows, { onConflict: "id" });

    if (categoryError) throw categoryError;

    const itemRows = categories.flatMap((category) =>
      category.items.map((item) => ({
        id: item.id,
        restaurant_id: restaurant.id,
        category_id: `${restaurant.id}-${category.id}`,
        name: item.name,
        description: item.description ?? null,
        price: item.price,
        image_url: null,
        is_available: true,
      })),
    );

    const { error: itemError } = await supabase
      .from("menu_items")
      .upsert(itemRows, { onConflict: "id" });

    if (itemError) throw itemError;
  }

  console.log("Supabase restaurant menus seeded successfully.");
}

seed().catch((error) => {
  console.error("Failed to seed Supabase menus:", error);
  process.exitCode = 1;
});
