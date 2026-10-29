
import { supabase } from "@/lib/supabase";

export type Topping = {
  id: string;
  name: string;
  price: number;
  applies_to_categories: string[] | null;
};

// Load the available toppings for a restaurant.
export async function loadToppings(
  restaurantId: string,
): Promise<Topping[]> {
  const { data, error } = await supabase
    .from("menu_toppings")
    .select("id, name, price, applies_to_categories")
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
    applies_to_categories:
      (row.applies_to_categories as string[] | null) ?? null,
  }));
}

function normalizeCategory(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Return toppings that apply to the selected item's category.
export function toppingsForItem(
  item: { category?: string | null },
  toppings: Topping[],
): Topping[] {
  const itemCategory = normalizeCategory(item.category ?? "");

  return toppings.filter((topping) => {
    const allowedCategories = topping.applies_to_categories ?? [];

    // An empty list means the topping applies to all categories.
    if (allowedCategories.length === 0) return true;

    return allowedCategories.some((allowed) => {
      const allowedCategory = normalizeCategory(allowed);

      if (!allowedCategory) return false;

      // Bloom Bakes' Tea toppings support Tea, Boba Tea,
      // Bubble Tea, and Milk Series items.
      if (
        allowedCategory === "tea" ||
        allowedCategory === "bobatea" ||
        allowedCategory === "bubbletea"
      ) {
        // Do not apply Tea toppings to Matcha-only items.
        if (
          itemCategory.includes("matcha") &&
          !itemCategory.includes("boba") &&
          !itemCategory.includes("tea")
        ) {
          return false;
        }

        return (
          itemCategory.includes("tea") ||
          itemCategory.includes("boba") ||
          itemCategory.includes("milkseries")
        );
      }

      // Match other categories without case or punctuation differences.
      return (
        itemCategory === allowedCategory ||
        itemCategory.includes(allowedCategory)
      );
    });
  });
}

// Give differently topped versions of the same item separate cart IDs.
// The payment Edge Function verifies topping IDs and prices from the database.
export function withToppings<T extends { id: string; price: number }>(
  item: T,
  chosen: Topping[],
) {
  if (chosen.length === 0) {
    return item;
  }

  const ids = chosen.map((topping) => topping.id).sort();
  const extra = chosen.reduce(
    (sum, topping) => sum + topping.price,
    0,
  );

  return {
    ...item,
    id: `${item.id}::${ids.join(",")}`,
    menuItemId: item.id,
    basePrice: item.price,
    price: Number((item.price + extra).toFixed(2)),
    toppings: chosen.map(({ id, name, price }) => ({
      id,
      name,
      price,
    })),
  };
}
