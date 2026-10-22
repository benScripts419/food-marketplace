import type { CartItem } from "@/context/CartContext";
import { calculateDeliveryFee, type Coordinates } from "@/lib/deliveryPricing";
import { getRestaurantLocation } from "@/lib/restaurantLocations";

/* =========================================================
   Delivery fee for a whole cart.

   - One delivery fee PER RESTAURANT in the cart, because each
     restaurant is a separate pickup. (Most carts have one.)
   - The extra-item fee counts the items from that restaurant.
   ========================================================= */

export type CartDeliveryResult =
  | { ok: true; fee: number; town: string }
  | { ok: false; message: string };

function messageFor(
  reason: "missing_location" | "outside_area" | "too_far",
  restaurantName: string,
): string {
  if (reason === "outside_area") {
    return "Sorry, your location is outside our delivery area.";
  }

  if (reason === "too_far") {
    return `Sorry, we can't deliver from ${restaurantName} to your location.`;
  }

  return "Please select your delivery location.";
}

export function quoteCartDelivery(
  cartItems: CartItem[],
  customer: Coordinates | null,
): CartDeliveryResult {
  if (
    !customer ||
    !Number.isFinite(customer.latitude) ||
    !Number.isFinite(customer.longitude)
  ) {
    return { ok: false, message: "Please select your delivery location." };
  }

  // Total quantity per restaurant
  const groups = new Map<string, { name: string; quantity: number }>();

  for (const item of cartItems) {
    const group = groups.get(item.restaurantId) ?? {
      name: item.restaurantName,
      quantity: 0,
    };

    group.quantity += item.quantity;
    groups.set(item.restaurantId, group);
  }

  if (groups.size === 0) {
    return { ok: false, message: "Your cart is empty." };
  }

  let fee = 0;
  let town = "";

  for (const group of groups.values()) {
    const restaurant = getRestaurantLocation(group.name);

    if (!restaurant) {
      return {
        ok: false,
        message: `We can't price delivery from ${group.name} yet. Please contact support.`,
      };
    }

    const quote = calculateDeliveryFee(restaurant, customer, group.quantity);

    if (!quote.ok) {
      return { ok: false, message: messageFor(quote.reason, group.name) };
    }

    fee += quote.fee;
    town = quote.town; // same customer location, so same town for every restaurant
  }

  return { ok: true, fee, town };
}

/* =========================================================
   Delivery fee for a "delivery only" request (no cart):
   the customer already ordered, so we price one restaurant
   and a typed-in item count with the same rules as checkout.
   ========================================================= */

export function quoteDeliveryFor(
  restaurantName: string,
  customer: Coordinates | null,
  quantity: number,
): CartDeliveryResult {
  const name = restaurantName.trim();

  if (!name) {
    return { ok: false, message: "Enter the restaurant name." };
  }

  if (
    !customer ||
    !Number.isFinite(customer.latitude) ||
    !Number.isFinite(customer.longitude)
  ) {
    return { ok: false, message: "Please select your delivery location." };
  }

  const restaurant = getRestaurantLocation(name);

  if (!restaurant) {
    return {
      ok: false,
      message: `We can't price delivery from ${name} yet. Check the spelling or contact support.`,
    };
  }

  const quote = calculateDeliveryFee(
    restaurant,
    customer,
    Math.max(1, Math.floor(quantity) || 1),
  );

  if (!quote.ok) {
    return { ok: false, message: messageFor(quote.reason, name) };
  }

  return { ok: true, fee: quote.fee, town: quote.town };
}