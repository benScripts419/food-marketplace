/* =========================================================
   Delivery fee from the customer's exact location
   ---------------------------------------------------------
   Fee = town price + extra for distance from the town pin
         + extra-item fee (only when the order has more than
           3 items)

   1. The customer's location is matched to the NEAREST town
      pin (the blue pins on your map).
   2. Town price: the distance from the restaurant (pickup) to
      that town, times `roadFactor`, picks a tier: GH₵10 / 20 /
      30 / 40.
   3. Extra: the further the customer is from the town pin, the
      more is added, up to a maximum. So every town has a price
      RANGE: its tier price up to tier price + maxExtra.
   4. Customers outside your delivery-area polygon can't order.

   Extra-item fee:
     - first (shortest) tier -> flat GH₵5
     - every other tier      -> 75% of the delivery fee

   Numbers marked PLACEHOLDER are guesses. Change them to your
   real prices.
   ========================================================= */

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Town price tiers, by estimated road km from the restaurant to the town pin.
 * Each tier applies up to and including `upToKm`. Keep them ascending.
 */
export const DELIVERY_TIERS: { upToKm: number; fee: number }[] = [
  { upToKm: 4, fee: 10 },  // Akropong, Dawu
  { upToKm: 8, fee: 20 },  // Awukugua, Mamfe, Adukrom
  { upToKm: 18, fee: 30 }, // Apirede, Mampong, Tutu
  { upToKm: 25, fee: 40 }, // Aburi (also the furthest you deliver)
];

/** Extra charged for how far the customer is from their town's pin. */
export const TOWN_EXTRA = {
  freeKm: 1,    // PLACEHOLDER: this close to the pin, nothing extra
  perKm: 2,     // PLACEHOLDER: GH₵ for every km beyond freeKm
  maxExtra: 10, // PLACEHOLDER: the most that can be added (range = tier price .. tier price + this)
};

export const DELIVERY_PRICING = {
  roadFactor: 1.3,            // the constant: straight-line distance x this = distance travelled
  freeItemCount: 3,           // up to this many items: no extra fee
  extraItemFeeFirstTier: 5,   // GH₵ extra fee on the shortest tier
  extraItemFeeOtherRate: 0.75 // other tiers: this share of the delivery fee
};

/** The towns (blue pins from your map). */
export const DELIVERY_TOWNS: { name: string; latitude: number; longitude: number }[] = [
  { name: "Akropong", latitude: 5.972021, longitude: -0.094687 },
  { name: "Dawu", latitude: 5.989076, longitude: -0.08478 },
  { name: "Awukugua", latitude: 5.998624, longitude: -0.081479 },
  { name: "Adukrom", latitude: 6.011594, longitude: -0.076847 },
  { name: "Apirede", latitude: 6.037553, longitude: -0.079052 },
  { name: "Mamfe", latitude: 5.938154, longitude: -0.119184 },
  { name: "Mampong", latitude: 5.913498, longitude: -0.140385 },
  { name: "Tutu", latitude: 5.891149, longitude: -0.157724 },
  { name: "Aburi", latitude: 5.841302, longitude: -0.179539 },
];

/** Your delivery-area polygon from the map, as [longitude, latitude] points. */
export const DELIVERY_AREA: [number, number][] = [
  [-0.077489, 6.043998],
  [-0.083762, 6.044724],
  [-0.085526, 6.030166],
  [-0.088744, 6.014522],
  [-0.101346, 5.995710],
  [-0.110470, 5.979903],
  [-0.117134, 5.964661],
  [-0.127068, 5.947334],
  [-0.163763, 5.916559],
  [-0.180281, 5.888196],
  [-0.210173, 5.837162],
  [-0.214549, 5.806530],
  [-0.198153, 5.802930],
  [-0.175962, 5.805980],
  [-0.169378, 5.814172],
  [-0.158315, 5.814060],
  [-0.151622, 5.833258],
  [-0.161006, 5.839138],
  [-0.160007, 5.846046],
  [-0.143271, 5.854360],
  [-0.133588, 5.852664],
  [-0.125236, 5.873770],
  [-0.083595, 5.909978],
  [-0.033566, 5.950053],
  [-0.012487, 5.964611],
  [-0.002643, 5.981645],
  [-0.011426, 5.995887],
  [-0.013632, 6.001676],
  [-0.007235, 6.008366],
  [0.004660, 6.009200],
  [-0.020773, 6.038923],
  [-0.049730, 6.054796],
  [-0.066131, 6.061335],
  [-0.074986, 6.048317],
];

export type DeliveryQuote =
  | {
      ok: true;
      town: string;               // nearest town pin
      tier: number;               // 1 = shortest
      distanceKm: number;         // restaurant -> town pin (est. road km), picks the tier
      townFee: number;            // the town's tier price
      distanceFromTownKm: number; // customer -> town pin (est. road km)
      extraFee: number;           // added for distance from the pin
      distanceFee: number;        // townFee + extraFee (the delivery fee before item fee)
      itemFee: number;            // extra-item fee (0 if 3 items or fewer)
      fee: number;                // distanceFee + itemFee
    }
  | {
      ok: false;
      reason: "missing_location" | "outside_area" | "too_far";
      distanceKm?: number;
    };

function isValidCoordinate(point: Coordinates | null | undefined): point is Coordinates {
  if (!point) return false;

  const { latitude, longitude } = point;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    // (0, 0) is what you get when a location was never saved
    !(latitude === 0 && longitude === 0)
  );
}

/** Straight-line distance in kilometres between two points. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const EARTH_RADIUS_KM = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Estimated distance travelled: straight line x roadFactor, to 0.1 km. */
function roadKm(a: Coordinates, b: Coordinates): number {
  return Math.round(haversineKm(a, b) * DELIVERY_PRICING.roadFactor * 10) / 10;
}

/** True if the point is inside the delivery-area polygon. */
export function isInsideDeliveryArea(point: Coordinates): boolean {
  let inside = false;

  for (let i = 0, j = DELIVERY_AREA.length - 1; i < DELIVERY_AREA.length; j = i++) {
    const [xi, yi] = DELIVERY_AREA[i]; // [longitude, latitude]
    const [xj, yj] = DELIVERY_AREA[j];

    const crosses =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;

    if (crosses) inside = !inside;
  }

  return inside;
}

/** The town pin closest to a point. */
export function nearestTown(point: Coordinates) {
  let best = DELIVERY_TOWNS[0];
  let bestDistance = haversineKm(point, best);

  for (const town of DELIVERY_TOWNS) {
    const distance = haversineKm(point, town);

    if (distance < bestDistance) {
      best = town;
      bestDistance = distance;
    }
  }

  return best;
}

/** Finds the tier for a distance, or null if it's beyond the last tier. */
export function tierFor(distanceKm: number): { tier: number; fee: number } | null {
  const index = DELIVERY_TIERS.findIndex((tier) => distanceKm <= tier.upToKm);

  if (index === -1) return null;

  return { tier: index + 1, fee: DELIVERY_TIERS[index].fee };
}

/** Rounds up to the nearest GH₵0.50. */
function roundUpToHalf(amount: number): number {
  return Math.ceil(amount * 2) / 2;
}

/** Extra for how far the customer is from the town pin (est. road km). */
export function extraFeeFor(distanceFromTownKm: number): number {
  const { freeKm, perKm, maxExtra } = TOWN_EXTRA;

  const beyondFree = Math.max(0, distanceFromTownKm - freeKm);

  return Math.min(maxExtra, roundUpToHalf(beyondFree * perKm));
}

/**
 * Extra-item fee. `itemCount` is the total quantity in the cart
 * (2 burgers + 2 drinks = 4 items). Only charged above `freeItemCount`.
 * `deliveryFee` is the town price plus the distance extra.
 */
export function itemFeeFor(itemCount: number, tier: number, deliveryFee: number): number {
  const { freeItemCount, extraItemFeeFirstTier, extraItemFeeOtherRate } = DELIVERY_PRICING;

  const safeCount = Number.isFinite(itemCount) ? Math.max(0, Math.floor(itemCount)) : 0;

  if (safeCount <= freeItemCount) return 0;

  if (tier === 1) return extraItemFeeFirstTier;

  return roundUpToHalf(deliveryFee * extraItemFeeOtherRate);
}

/** The one function checkout should call. */
export function calculateDeliveryFee(
  restaurant: Coordinates | null | undefined,
  customer: Coordinates | null | undefined,
  itemCount: number,
): DeliveryQuote {
  if (!isValidCoordinate(restaurant) || !isValidCoordinate(customer)) {
    return { ok: false, reason: "missing_location" };
  }

  if (!isInsideDeliveryArea(customer)) {
    return { ok: false, reason: "outside_area" };
  }

  const town = nearestTown(customer);
  const distanceKm = roadKm(restaurant, town);
  const match = tierFor(distanceKm);

  if (!match) {
    return { ok: false, reason: "too_far", distanceKm };
  }

  const distanceFromTownKm = roadKm(customer, town);
  const extraFee = extraFeeFor(distanceFromTownKm);
  const distanceFee = match.fee + extraFee;
  const itemFee = itemFeeFor(itemCount, match.tier, distanceFee);

  return {
    ok: true,
    town: town.name,
    tier: match.tier,
    distanceKm,
    townFee: match.fee,
    distanceFromTownKm,
    extraFee,
    distanceFee,
    itemFee,
    fee: distanceFee + itemFee,
  };
}

/** Each town's price range from one restaurant, cheapest first (before any extra-item fee). */
export function townPriceRanges(restaurant: Coordinates | null | undefined) {
  if (!isValidCoordinate(restaurant)) return [];

  return DELIVERY_TOWNS.flatMap((town) => {
    const distanceKm = roadKm(restaurant, town);
    const match = tierFor(distanceKm);

    if (!match) return [];

    return [
      {
        town: town.name,
        tier: match.tier,
        distanceKm,
        minFee: match.fee,
        maxFee: match.fee + TOWN_EXTRA.maxExtra,
      },
    ];
  }).sort((a, b) => a.minFee - b.minFee || a.town.localeCompare(b.town));
}