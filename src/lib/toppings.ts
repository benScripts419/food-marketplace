import { supabase } from "@/lib/supabase";

export type Topping = {
  id: string;
  name: string;
  price: number;
  applies_to_categories: string[] | null;
};

// The toppings a restaurant offers.
export async function loadToppings(restaurantId: string): Promise<Topping[]> {
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
    applies_to_categories: (row.applies_to_categories as string[] | null) ?? null,
  }));
}

// The toppings that can go on one menu item (matched on its category).
export function toppingsForItem(
  item: { category: string },
  toppings: Topping[],
): Topping[] {
  return toppings.filter((topping) => {
    const categories = topping.applies_to_categories;

    if (!categories || categories.length === 0) return true;

    return categories.some(
      (category) => category.toLowerCase() === item.category.toLowerCase(),
    );
  });
}

// Turns a menu item and the toppings chosen for it into a cart line.
//
// A cart line is told apart by its id, so the same drink with different
// toppings becomes separate lines. With toppings the id is
// "<menu item id>::<topping ids>"; the real menu item id is kept in
// menuItemId, and `price` already includes the toppings. The server works the
// price out again from the database before anything is charged.
export function withToppings<T extends { id: string; price: number }>(
  item: T,
  chosen: Topping[],
) {
  if (chosen.length === 0) {
    return item;
  }

  const ids = chosen.map((topping) => topping.id).sort();
  const extra = chosen.reduce((sum, topping) => sum + topping.price, 0);

  return {
    ...item,
    id: `${item.id}::${ids.join(",")}`,
    menuItemId: item.id,
    basePrice: item.price,
    price: Number((item.price + extra).toFixed(2)),
    toppings: chosen.map(({ id, name, price }) => ({ id, name, price })),
  };
}