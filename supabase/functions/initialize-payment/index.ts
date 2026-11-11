import { createClient } from "jsr:@supabase/supabase-js@2";

// Shared, KML-backed pricing: the same algorithm as the Expo checkout.
import { calculateDeliveryFee } from "../_shared/deliveryPricing.ts";

type Coordinates = { latitude: number; longitude: number };

// Trusted restaurant pickup coordinates from the existing AkroBite map.
const RESTAURANT_LOCATIONS = [
  { name: "Kwayisibea Hotel", latitude: 5.953228, longitude: -0.102554 },
  { name: "50 cent", latitude: 5.969534, longitude: -0.090416 },
  { name: "lizjay's eatery", latitude: 5.969975, longitude: -0.090224 },
  { name: "concept", latitude: 5.965094, longitude: -0.095873 },
  { name: "bloombakes", latitude: 5.969285, longitude: -0.090553 },
  { name: "pam's check check", latitude: 5.969823, longitude: -0.089948 },
  { name: "brackers", latitude: 5.970723, longitude: -0.089518 },
  { name: "roll'd up", latitude: 5.969198, longitude: -0.090575 },
];


function normaliseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getRestaurantLocation(restaurantName: string): Coordinates | null {
  const wanted = normaliseName(restaurantName);
  if (!wanted) return null;
  const exact = RESTAURANT_LOCATIONS.find((r) => normaliseName(r.name) === wanted);
  if (exact) return { latitude: exact.latitude, longitude: exact.longitude };
  return null;
}

/* ========================================================= */

// Turns what the customer typed into +233XXXXXXXXX, or null if invalid.
function normalisePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  let national: string;
  if (digits.startsWith("233") && digits.length === 12) {
    national = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 10) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  } else {
    return null;
  }
  if (!/^[235]\d{8}$/.test(national)) return null;
  return `+233${national}`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLLD_UP_RESTAURANT_ID = "0a7aae53-94c5-428c-88c5-3e6cd88ee911";

// Must match `serviceFee` in the app's payment screen.
const SERVICE_FEE = 7.5;

type SelectedTopping = {
  id: string;
  name?: string;
  price?: number;
};

type CartItem = {
  id: string;
  menuItemId?: string;
  toppings?: SelectedTopping[];
  name: string;
  description?: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
};

type FreeItemSelection = {
  itemId: string;
  restaurantId: string;
};

type DeliveryLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

type PaymentRequest = {
  cartItems: CartItem[];
  deliveryOption: "standard" | "express";
  freeItemSelections?: FreeItemSelection[];
  deliveryLocation?: DeliveryLocation;
  customer?: { name?: string; phone?: string; altPhone?: string };
};

type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  is_available: boolean;
};

type MenuCategory = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
};

type MenuTopping = {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  applies_to_categories: string[] | null;
  is_available: boolean;
};

type Restaurant = {
  id: string;
  name: string;
  is_open: boolean;
  address: string | null;
};

type CartLinePricing = {
  baseItemId: string;
  basePrice: number;
  unitPrice: number;
  toppings: MenuTopping[];
};

// Topping-specific cart IDs are formed by withToppings() as
// "<base menu item id>::<sorted topping IDs>". Always verify the
// base ID against menu_items and calculate price from database values.
function getBaseMenuItemId(item: CartItem): string {
  return item.id.split("::", 1)[0];
}

function getToppingIds(item: CartItem): string[] {
  return (item.toppings ?? []).map((topping) => topping.id).sort();
}

function normalizeCategoryName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toppingAppliesToCategory(
  topping: MenuTopping,
  category: MenuCategory | undefined,
): boolean {
  const allowedCategories = topping.applies_to_categories ?? [];
  if (allowedCategories.length === 0) return true;
  if (!category) return false;

  const name = category.name ?? "";
  const description = category.description ?? "";
  const combined = `${name} ${description}`.toLowerCase();
  const normalizedName = normalizeCategoryName(name);
  const normalizedDescription = normalizeCategoryName(description);

  return allowedCategories.some((allowed) => {
    const wanted = normalizeCategoryName(allowed);

    // Support the app's display labels even when database categories use
    // names such as "The Bloom Boba Tea", "Milk Series", or "Matcha".
    if (wanted === "bobatea" || wanted === "tea") {
      if (combined.includes("matcha") && !combined.includes("boba")) {
        return false;
      }
      return combined.includes("boba") || combined.includes("tea");
    }

    if (wanted === "matcha") {
      return combined.includes("matcha");
    }

    return (
      normalizedName === wanted ||
      normalizedDescription === wanted ||
      normalizedName.includes(wanted) ||
      normalizedDescription.includes(wanted)
    );
  });
}

function hasValidToppingCartId(item: CartItem): boolean {
  const separatorIndex = item.id.indexOf("::");
  const selectedIds = getToppingIds(item);

  if (separatorIndex < 0) {
    return selectedIds.length === 0;
  }

  const baseId = item.id.slice(0, separatorIndex);
  const suffix = item.id.slice(separatorIndex + 2);
  if (!baseId || !suffix || selectedIds.length === 0) return false;

  const suffixIds = suffix.split(",").sort();
  return suffixIds.join(",") === selectedIds.join(",");
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------
    console.log("INITIALIZE PAYMENT v5 - verified toppings and location pricing");
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey ||
      !paystackSecretKey
    ) {
      return jsonResponse(
        {
          error:
            "Required Supabase or Paystack environment variables are missing.",
        },
        500,
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // --------------------------------------------------
    // 2. Read request
    // --------------------------------------------------
    const rawBody = await req.json();
    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return jsonResponse({ error: "Invalid payment request." }, 400);
    }
    const body = rawBody as PaymentRequest;
    console.log("PAYMENT REQUEST RECEIVED");

    const {
      cartItems,
      deliveryOption,
      freeItemSelections = [],
      deliveryLocation,
      customer,
    } = body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return jsonResponse({ error: "Your cart is empty." }, 400);
    }

    if (
      !deliveryLocation ||
      typeof deliveryLocation.address !== "string" ||
      !deliveryLocation.address.trim() ||
      deliveryLocation.address.length > 500 ||
      typeof deliveryLocation.latitude !== "number" ||
      !Number.isFinite(deliveryLocation.latitude) ||
      deliveryLocation.latitude < -90 ||
      deliveryLocation.latitude > 90 ||
      typeof deliveryLocation.longitude !== "number" ||
      !Number.isFinite(deliveryLocation.longitude) ||
      deliveryLocation.longitude < -180 ||
      deliveryLocation.longitude > 180
    ) {
      return jsonResponse(
        { error: "Choose a valid delivery location before paying." },
        400,
      );
    }

    if (deliveryOption !== "standard" && deliveryOption !== "express") {
      return jsonResponse({ error: "Invalid delivery option." }, 400);
    }
    if (!Array.isArray(freeItemSelections)) {
      return jsonResponse({ error: "Invalid free item selections." }, 400);
    }

    // Contact details the rider will use.
    const customerName =
      typeof customer?.name === "string"
        ? customer.name.trim().replace(/\s+/g, " ")
        : "";
    const customerPhone = normalisePhone(String(customer?.phone ?? ""));
    const rawAltPhone = String(customer?.altPhone ?? "").trim();
    const parsedAltPhone = rawAltPhone ? normalisePhone(rawAltPhone) : null;

    if (
      customerName.length < 2 ||
      customerName.length > 100 ||
      !customerPhone
    ) {
      return jsonResponse(
        { error: "Enter your name and a valid phone number the rider can call." },
        400,
      );
    }
    if (rawAltPhone && !parsedAltPhone) {
      return jsonResponse(
        { error: "The alternative phone number is not valid." },
        400,
      );
    }
    const customerAltPhone =
      parsedAltPhone && parsedAltPhone !== customerPhone ? parsedAltPhone : null;

    for (const item of cartItems) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !item.id ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        typeof item.restaurantId !== "string" ||
        !item.restaurantId ||
        (item.toppings !== undefined &&
          (!Array.isArray(item.toppings) || item.toppings.length > 5 ||
            item.toppings.some(
              (topping) =>
                !topping ||
                typeof topping.id !== "string" ||
                !topping.id.trim(),
            )))
      ) {
        return jsonResponse({ error: "Invalid cart item." }, 400);
      }

      if (!hasValidToppingCartId(item)) {
        return jsonResponse(
          { error: "The selected toppings do not match this cart item. Refresh your cart and try again." },
          400,
        );
      }

      const toppingIds = getToppingIds(item);
      if (new Set(toppingIds).size !== toppingIds.length) {
        return jsonResponse(
          { error: "A topping cannot be selected more than once." },
          400,
        );
      }
    }

    for (const selection of freeItemSelections) {
      if (
        !selection ||
        typeof selection.itemId !== "string" ||
        !selection.itemId ||
        typeof selection.restaurantId !== "string" ||
        !selection.restaurantId
      ) {
        return jsonResponse({ error: "Invalid free item selection." }, 400);
      }
    }

    const requestedItemIds = [
      ...new Set([
        ...cartItems.map(getBaseMenuItemId),
        ...freeItemSelections.map((selection) => selection.itemId),
      ]),
    ];

    const { data: menuItems, error: menuItemsError } = await supabaseAdmin
      .from("menu_items")
      .select(
        "id, restaurant_id, category_id, name, description, image_url, price, is_available",
      )
      .in("id", requestedItemIds);

    if (menuItemsError) {
      console.error("Menu item lookup error:", menuItemsError);
      return jsonResponse({ error: "Failed to verify cart items." }, 500);
    }

    if (!menuItems || menuItems.length !== requestedItemIds.length) {
      return jsonResponse(
        {
          error:
            "One or more cart items are not in the current menu. Refresh the menu and try again.",
        },
        400,
      );
    }

    const verifiedMenuItems = menuItems as MenuItem[];
    const menuItemMap = new Map<string, MenuItem>();
    for (const item of verifiedMenuItems) {
      menuItemMap.set(item.id, item);
    }

    // Resolve category labels through menu_items.category_id. The schema uses
    // menu_categories, not a direct menu_items.category text column.
    const categoryIds = [
      ...new Set(
        verifiedMenuItems
          .map((item) => item.category_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const menuCategoryMap = new Map<string, MenuCategory>();

    if (categoryIds.length > 0) {
      const { data: categories, error: categoriesError } = await supabaseAdmin
        .from("menu_categories")
        .select("id, restaurant_id, name, description")
        .in("id", categoryIds);

      if (categoriesError) {
        console.error("Menu category lookup error:", categoriesError);
        return jsonResponse(
          { error: "Failed to verify menu categories." },
          500,
        );
      }

      for (const category of (categories ?? []) as MenuCategory[]) {
        menuCategoryMap.set(category.id, category);
      }
    }

    const restaurantIds = [
      ...new Set(verifiedMenuItems.map((item) => item.restaurant_id)),
    ];
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from("restaurants")
      .select("id, name, is_open, address")
      .in("id", restaurantIds);

    if (restaurantsError) {
      console.error("Restaurant lookup error:", restaurantsError);
      return jsonResponse({ error: "Failed to verify restaurants." }, 500);
    }

    const restaurantMap = new Map<string, Restaurant>();
    for (const restaurant of (restaurants ?? []) as Restaurant[]) {
      restaurantMap.set(restaurant.id, restaurant);
    }

    // --------------------------------------------------
    // 3. Verify toppings and calculate the authoritative subtotal
    // --------------------------------------------------
    const requestedToppingIds = [
      ...new Set(
        cartItems.flatMap((item) => getToppingIds(item)),
      ),
    ];
    const toppingMap = new Map<string, MenuTopping>();

    if (requestedToppingIds.length > 0) {
      const { data: toppingsData, error: toppingsError } = await supabaseAdmin
        .from("menu_toppings")
        .select(
          "id, restaurant_id, name, price, applies_to_categories, is_available",
        )
        .in("id", requestedToppingIds);

      if (toppingsError) {
        console.error("Topping lookup error:", toppingsError);
        return jsonResponse(
          { error: "Failed to verify selected toppings." },
          500,
        );
      }

      if (!toppingsData || toppingsData.length !== requestedToppingIds.length) {
        return jsonResponse(
          { error: "A selected topping is invalid. Refresh your cart and try again." },
          400,
        );
      }

      for (const topping of toppingsData as MenuTopping[]) {
        toppingMap.set(topping.id, topping);
      }
    }

    let subtotal = 0;
    const cartLinePricing = new Map<string, CartLinePricing>();

    for (const item of cartItems) {
      const baseItemId = getBaseMenuItemId(item);
      const menuItem = menuItemMap.get(baseItemId);
      const restaurant = menuItem
        ? restaurantMap.get(menuItem.restaurant_id)
        : undefined;

      if (
        !menuItem ||
        menuItem.restaurant_id !== item.restaurantId ||
        !menuItem.is_available ||
        !restaurant ||
        !restaurant.is_open
      ) {
        return jsonResponse(
          {
            error: "A cart item is unavailable. Refresh your cart and try again.",
          },
          400,
        );
      }

      const basePrice = Number(menuItem.price);
      if (!Number.isFinite(basePrice) || basePrice < 0) {
        console.error("Invalid menu price:", { menuItemId: baseItemId });
        return jsonResponse(
          { error: "A menu item has an invalid price." },
          500,
        );
      }

      const selectedToppings: MenuTopping[] = [];
      for (const toppingSelection of item.toppings ?? []) {
        const topping = toppingMap.get(toppingSelection.id);

        if (
          !topping ||
          !topping.is_available ||
          topping.restaurant_id !== menuItem.restaurant_id
        ) {
          return jsonResponse(
            { error: "A selected topping is unavailable for this restaurant." },
            400,
          );
        }

        const menuCategory = menuItem.category_id
          ? menuCategoryMap.get(menuItem.category_id)
          : undefined;

        if (
          menuCategory &&
          menuCategory.restaurant_id !== menuItem.restaurant_id
        ) {
          return jsonResponse(
            { error: "The menu item's category is invalid." },
            400,
          );
        }

        if (!toppingAppliesToCategory(topping, menuCategory)) {
          return jsonResponse(
            {
              error: `The topping "${topping.name}" is not available for this item.`,
            },
            400,
          );
        }

        const toppingPrice = Number(topping.price);
        if (!Number.isFinite(toppingPrice) || toppingPrice < 0) {
          console.error("Invalid topping price:", { toppingId: topping.id });
          return jsonResponse(
            { error: "A selected topping has an invalid price." },
            500,
          );
        }

        selectedToppings.push({ ...topping, price: toppingPrice });
      }

      const toppingsTotal = selectedToppings.reduce(
        (sum, topping) => sum + topping.price,
        0,
      );
      const unitPrice = Number((basePrice + toppingsTotal).toFixed(2));

      cartLinePricing.set(item.id, {
        baseItemId,
        basePrice,
        unitPrice,
        toppings: selectedToppings,
      });

      subtotal += unitPrice * item.quantity;
    }

    subtotal = Number(subtotal.toFixed(2));
    console.log("VERIFIED FOOD SUBTOTAL", {
      subtotal,
      cartLines: cartItems.length,
      toppings: requestedToppingIds.length,
    });

    // --------------------------------------------------
    // 4. Promotion
    //
    // Buy 3 qualifying paid items → choose 1 free item.
    // 6 paid items → choose 2 free items.
    // 9 paid items → choose 3 free items.
    // --------------------------------------------------
    const isWednesday = new Date().getUTCDay() === 3;
    let promotionDiscount = 0;
    let qualifyingItemCount = 0;

    for (const item of cartItems) {
      if (item.restaurantId === ROLLD_UP_RESTAURANT_ID) {
        qualifyingItemCount += item.quantity;
      }
    }

    const selectedFreeItemCount = freeItemSelections.length;
    const selectionKeys = freeItemSelections.map(
      (selection) => `${selection.restaurantId}:${selection.itemId}`,
    );

    if (new Set(selectionKeys).size !== selectionKeys.length) {
      return jsonResponse(
        { error: "The same free item cannot be selected more than once." },
        400,
      );
    }

    for (const selection of freeItemSelections) {
      const menuItem = menuItemMap.get(selection.itemId);
      const cartItem = cartItems.find(
        (item) =>
          getBaseMenuItemId(item) === selection.itemId &&
          item.restaurantId === selection.restaurantId,
      );

      if (
        selection.restaurantId !== ROLLD_UP_RESTAURANT_ID ||
        !menuItem ||
        menuItem.restaurant_id !== ROLLD_UP_RESTAURANT_ID ||
        !menuItem.is_available ||
        !cartItem
      ) {
        return jsonResponse(
          { error: "A selected free item is invalid or unavailable." },
          400,
        );
      }

      const sameItemSelections = freeItemSelections.filter(
        (candidate) => candidate.itemId === selection.itemId,
      ).length;
      if (sameItemSelections > cartItem.quantity) {
        return jsonResponse(
          { error: "A selected free item is not present in the cart." },
          400,
        );
      }
    }

    const paidQualifyingItemCount = Math.max(
      0,
      qualifyingItemCount - selectedFreeItemCount,
    );

    const freeItemsUnlocked = isWednesday
      ? Math.floor(paidQualifyingItemCount / 3)
      : 0;

    // --------------------------------------------------
    // 5. Validate free item selections
    // --------------------------------------------------
    if (!isWednesday && freeItemSelections.length > 0) {
      return jsonResponse(
        { error: "The Roll'd Up promotion is not active today." },
        400,
      );
    }

    if (freeItemSelections.length > freeItemsUnlocked) {
      return jsonResponse(
        { error: "You have selected more free items than your promotion allows." },
        400,
      );
    }

    if (freeItemSelections.length > 0) {
      for (const selection of freeItemSelections) {
        const menuItem = menuItemMap.get(selection.itemId);
        if (menuItem) {
          promotionDiscount += Number(menuItem.price);
        }
      }
      promotionDiscount = Number(promotionDiscount.toFixed(2));
    }

    // --------------------------------------------------
    // 6. Calculate final totals
    // --------------------------------------------------
    const totalItemCount = cartItems.reduce(
      (count, item) => count + item.quantity,
      0,
    );
    if (!Number.isSafeInteger(totalItemCount) || totalItemCount < 1) {
      return jsonResponse({ error: "Cart contains too many items." }, 400);
    }

    const groups = new Map<string, { name: string; quantity: number }>();
    for (const item of cartItems) {
      const group = groups.get(item.restaurantId) ?? {
        name: restaurantMap.get(item.restaurantId)?.name ?? "",
        quantity: 0,
      };
      group.quantity += item.quantity;
      groups.set(item.restaurantId, group);
    }

    // One quote per restaurant group, preserving the existing multi-pickup
    // behavior and the extra-item threshold per pickup group.
    // Pricing is authoritative here; never accept a fee from the client.
    let deliveryFee = 0;
    let deliveryTown = "";
    for (const group of groups.values()) {
      const pickup = getRestaurantLocation(group.name);
      if (!pickup) {
        return jsonResponse(
          { error: `We can't price delivery from ${group.name} yet.` },
          400,
        );
      }

      const quote = calculateDeliveryFee(pickup, deliveryLocation, group.quantity);
      if (!quote.ok) {
        return jsonResponse(
          { error: "Sorry, we can't deliver to your location." },
          400,
        );
      }
      deliveryFee += quote.fee;
      deliveryTown = quote.town;
    }

    // The rider earns 80% of the delivery fee; AkroBite keeps 20%.
    const riderPayoutFee = Number((deliveryFee * 0.8).toFixed(2));

    console.log("DELIVERY QUOTE", { deliveryFee, deliveryTown, totalItemCount, SERVICE_FEE });

    const serviceFee = SERVICE_FEE;
    const discountedFoodTotal = Number(
      Math.max(0, subtotal - promotionDiscount).toFixed(2),
    );
    const total = Number(
      (discountedFoodTotal + deliveryFee + serviceFee).toFixed(2),
    );

    if (!Number.isFinite(total) || total <= 0) {
      return jsonResponse(
        { error: "Payment amount must be greater than zero." },
        400,
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        customer_id: user.id,
        restaurant_id: restaurantIds.length === 1 ? restaurantIds[0] : null,
        subtotal,
        promotion_discount: promotionDiscount,
        delivery_fee: deliveryFee,
        rider_payout_fee: riderPayoutFee,
        service_fee: serviceFee,
        total,
        delivery_option: deliveryOption,
        status: "pending",
        payment_status: "pending",
        payment_method: "paystack",
        customer_email: user.email ?? null,
        restaurant: [...new Set([...groups.values()].map((g) => g.name))].join(", "),
        restaurant_address:
          [
            ...new Set(
              [...groups.keys()]
                .map((restaurantId) => restaurantMap.get(restaurantId)?.address)
                .filter((address): address is string => Boolean(address)),
            ),
          ].join(" | ") || null,
        customer: customerName,
        customer_name: customerName,
        phone: customerPhone,
        customer_phone: customerPhone,
        customer_alt_phone: customerAltPhone,
        delivery_town: deliveryTown,
        customer_address: deliveryLocation.address.trim(),
        customer_latitude: deliveryLocation.latitude,
        customer_longitude: deliveryLocation.longitude,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return jsonResponse(
        { error: orderError?.message ?? "Failed to create order." },
        500,
      );
    }

    const removeUnpaidOrder = async () => {
      const { error } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);
      if (error) {
        console.error("Failed to clean up order:", error);
      }
    };

    // --------------------------------------------------
    // 7. Create order items, including verified topping details
    // --------------------------------------------------
    const orderItems = cartItems.map((item) => {
      const pricing = cartLinePricing.get(item.id);
      if (!pricing) {
        throw new Error(`Missing verified price for cart item ${item.id}`);
      }

      const menuItem = menuItemMap.get(pricing.baseItemId);
      if (!menuItem) {
        throw new Error(`Missing menu item ${pricing.baseItemId}`);
      }

      return {
        menu_item_id: pricing.baseItemId,
        order_id: order.id,
        name: menuItem.name,
        item_name: menuItem.name,
        description: menuItem.description ?? null,
        price: pricing.unitPrice,
        unit_price: pricing.unitPrice,
        quantity: item.quantity,
        restaurant_id: item.restaurantId,
        restaurant_name:
          restaurantMap.get(item.restaurantId)?.name ?? item.restaurantName,
        image: menuItem.image_url,
        toppings: pricing.toppings.map((topping) => ({
          id: topping.id,
          name: topping.name,
          price: topping.price,
        })),
      };
    });

    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Order items creation error:", orderItemsError);
      await removeUnpaidOrder();
      return jsonResponse({ error: "Failed to create order items." }, 500);
    }

    // --------------------------------------------------
    // 8. Initialize Paystack
    // --------------------------------------------------
    const reference = `AKROBITE-${order.id}-${Date.now()}`;
    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({ payment_reference: reference })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error("Order reference update error:", updateOrderError);
      await removeUnpaidOrder();
      return jsonResponse(
        { error: "Failed to prepare the order for payment." },
        500,
      );
    }

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email ?? `customer-${user.id}@akrobite.app`,
          amount: Math.round(total * 100),
          currency: "GHS",
          reference,
          channels: ["card", "mobile_money", "bank", "ussd", "bank_transfer"],
          metadata: {
            order_id: order.id,
            user_id: user.id,
            subtotal,
            promotion_discount: promotionDiscount,
            discounted_food_total: discountedFoodTotal,
            delivery_fee: deliveryFee,
            service_fee: serviceFee,
            delivery_option: deliveryOption,
            free_item_selections: freeItemSelections,
            promotion: promotionDiscount > 0 ? "ROLLD_UP_WEDNESDAY" : null,
            topping_selections: cartItems.map((item) => ({
              item_id: getBaseMenuItemId(item),
              quantity: item.quantity,
              toppings: (cartLinePricing.get(item.id)?.toppings ?? []).map((topping) => ({
                id: topping.id,
                name: topping.name,
                price: topping.price,
              })),
            })),
          },
        }),
      },
    );

    const paystackData = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      !paystackData.data?.authorization_url
    ) {
      console.error("Paystack initialization error:", paystackData);
      await removeUnpaidOrder();
      return jsonResponse(
        {
          error:
            paystackData?.message ?? "Failed to initialize Paystack payment.",
        },
        500,
      );
    }

    // --------------------------------------------------
    // 9. Create payment record
    // --------------------------------------------------
    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: order.id,
        user_id: user.id,
        reference,
        amount: total,
        currency: "GHS",
        status: "pending",
        raw_response: paystackData,
      });

    if (paymentError) {
      console.error("Payment record error:", paymentError);
      await removeUnpaidOrder();
      return jsonResponse(
        { error: "Failed to create payment record." },
        500,
      );
    }

    // --------------------------------------------------
    // 10. Return payment information
    // --------------------------------------------------
    return jsonResponse({
      orderId: order.id,
      reference,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      subtotal,
      promotionDiscount,
      deliveryFee,
      serviceFee,
      total,
      currency: "GHS",
    });
  } catch (error) {
    console.error("INITIALIZE PAYMENT ERROR:", error);
    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error.",
      },
      500,
    );
  }
});
