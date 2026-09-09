import { createClient } from "@supabase/supabase-js";

import { bloomBakesMenu } from "../src/data/bloomBakesMenu";
import { brachersInnMenu } from "../src/data/brackersInnMenu";
import { kwayisibeaMenu } from "../src/data/kwayisibeaMenu";

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

const menus = [
  { restaurantId: "1", categories: kwayisibeaMenu },
  { restaurantId: "7", categories: bloomBakesMenu },
  { restaurantId: "8", categories: brachersInnMenu },
];

async function seed() {
  for (const { restaurantId, categories } of menus) {
    const categoryRows = categories.map((category, sortOrder) => ({
      id: `${restaurantId}-${category.id}`,
      restaurant_id: restaurantId,
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
        restaurant_id: restaurantId,
        category_id: `${restaurantId}-${category.id}`,
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
  console.error(error);
  process.exitCode = 1;
});
