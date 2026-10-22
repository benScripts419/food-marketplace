import { supabase } from "@/lib/supabase";

export type RiderDeliveryItem = {
  item_name: string | null;
  name: string | null;
  quantity: number;
};

export type RiderDelivery = {
  id: string;
  restaurant: string | null;
  restaurant_address: string | null;
  restaurant_latitude: number | null;
  restaurant_longitude: number | null;
  customer: string | null;
  customer_address: string | null;
  customer_latitude: number | null;
  customer_longitude: number | null;
  phone: string | null;
  delivery_fee: number;
  rider_payout_fee: number;
  delivery_notes: string | null;
  status: string;
  order_items: RiderDeliveryItem[];
};

function toCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function loadAssignedRiderDelivery(
  orderId: string | undefined,
): Promise<RiderDelivery> {
  if (!orderId) {
    throw new Error("Delivery ID is missing.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("Sign in to view this delivery.");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, restaurant_id, order_type, pickup_latitude, pickup_longitude, order_details, restaurant, restaurant_address, customer, customer_address, customer_latitude, customer_longitude, phone, delivery_fee, rider_payout_fee, delivery_notes, status, order_items(item_name, name, quantity)",
    )
    .eq("id", orderId)
    .eq("rider_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("This delivery is not assigned to your rider account.");
  }

  const deliveryFee = Number(data.delivery_fee);
  const riderPayoutFee = Number(data.rider_payout_fee);
  if (
    !Number.isFinite(deliveryFee) ||
    !Number.isFinite(riderPayoutFee) ||
    typeof data.status !== "string"
  ) {
    throw new Error("The delivery record contains invalid details.");
  }

  // The restaurant's position and address, for navigation. If it can't be
  // loaded, the delivery still opens and the address text is used instead.
  let restaurantLatitude: number | null = null;
  let restaurantLongitude: number | null = null;
  let restaurantAddress: string | null = data.restaurant_address;

  if (data.restaurant_id) {
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("latitude, longitude, address")
      .eq("id", data.restaurant_id)
      .maybeSingle();

    if (restaurant) {
      restaurantLatitude = toCoordinate(restaurant.latitude);
      restaurantLongitude = toCoordinate(restaurant.longitude);
      restaurantAddress = restaurantAddress ?? restaurant.address ?? null;
    }
  }

  // A delivery request has no restaurant: the pickup is where the customer said.
  let deliveryNotes: string | null = data.delivery_notes;

  if (data.order_type === "delivery") {
    restaurantLatitude = toCoordinate(data.pickup_latitude);
    restaurantLongitude = toCoordinate(data.pickup_longitude);

    deliveryNotes =
      [
        data.order_details ? `Collect: ${data.order_details}` : null,
        data.delivery_notes,
      ]
        .filter(Boolean)
        .join("\n") || null;
  }

  return {
    id: data.id,
    restaurant: data.restaurant,
    restaurant_address: restaurantAddress,
    restaurant_latitude: restaurantLatitude,
    restaurant_longitude: restaurantLongitude,
    customer: data.customer,
    customer_address: data.customer_address,
    customer_latitude:
      typeof data.customer_latitude === "number"
        ? data.customer_latitude
        : null,
    customer_longitude:
      typeof data.customer_longitude === "number"
        ? data.customer_longitude
        : null,
    phone: data.phone,
    delivery_fee: deliveryFee,
    rider_payout_fee: riderPayoutFee,
    delivery_notes: deliveryNotes,
    status: data.status,
    order_items: data.order_items ?? [],
  };
}