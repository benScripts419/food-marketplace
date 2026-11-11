import { DELIVERY_GEOGRAPHY } from "./deliveryGeography";

export type Coordinates = { latitude: number; longitude: number };
export const DELIVERY_TIERS = [
  { upToKm: 4, fee: 10 },
  { upToKm: 8, fee: 20 },
  { upToKm: 18, fee: 30 },
  { upToKm: 25, fee: 40 },
] as const;
export const TOWN_EXTRA = { freeKm: 1, perKm: 2, maxExtra: 10 } as const;
export const DELIVERY_PRICING = {
  roadFactor: 1.3,
  freeItemCount: 3,
  extraItemFeeFirstTier: 5,
  extraItemFeeOtherRate: 0.75,
} as const;

export type DeliveryQuote =
  | { ok: true; town: string; zone: string | null; tier: number;
      distanceKm: number; townFee: number; distanceFromTownKm: number;
      extraFee: number; distanceFee: number; itemFee: number; fee: number }
  | { ok: false; reason: "missing_location" | "outside_area" | "too_far"; distanceKm?: number };

function valid(p: Coordinates | null | undefined): p is Coordinates {
  return !!p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
    && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180
    && !(p.latitude === 0 && p.longitude === 0);
}
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const rad = (n: number) => n * Math.PI / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude))
    * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)));
}
function roadKm(a: Coordinates, b: Coordinates) {
  return Math.round(haversineKm(a, b) * DELIVERY_PRICING.roadFactor * 10) / 10;
}
type Pair = readonly [number, number];
function onSegment(x: number, y: number, a: Pair, b: Pair): boolean {
  const cross = (x - a[0]) * (b[1] - a[1]) - (y - a[1]) * (b[0] - a[0]);
  return Math.abs(cross) < 1e-10 && x >= Math.min(a[0], b[0]) - 1e-10
    && x <= Math.max(a[0], b[0]) + 1e-10 && y >= Math.min(a[1], b[1]) - 1e-10
    && y <= Math.max(a[1], b[1]) + 1e-10;
}
function inPolygon(point: Coordinates, polygon: readonly Pair[]): boolean {
  let inside = false;
  const x = point.longitude, y = point.latitude;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i];
    if (onSegment(x, y, a, b)) return true;
    if ((a[1] > y) !== (b[1] > y) &&
        x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
export function isInsideDeliveryArea(point: Coordinates): boolean {
  return valid(point) && inPolygon(point, DELIVERY_GEOGRAPHY.serviceArea);
}
export function deliveryZone(point: Coordinates): string | null {
  if (!valid(point)) return null;
  return DELIVERY_GEOGRAPHY.zones.find(z => inPolygon(point, z.polygon))?.name ?? null;
}
export function nearestTown(point: Coordinates) {
  return DELIVERY_GEOGRAPHY.towns.reduce((best, town) =>
    haversineKm(point, town) < haversineKm(point, best) ? town : best);
}
export function tierFor(distanceKm: number): { tier: number; fee: number } | null {
  const index = DELIVERY_TIERS.findIndex(t => distanceKm <= t.upToKm);
  return index < 0 ? null : { tier: index + 1, fee: DELIVERY_TIERS[index].fee };
}
function roundUpHalf(n: number) { return Math.ceil((n - 1e-9) * 2) / 2; }
export function extraFeeFor(distanceKm: number): number {
  return Math.min(TOWN_EXTRA.maxExtra,
    roundUpHalf(Math.max(0, distanceKm - TOWN_EXTRA.freeKm) * TOWN_EXTRA.perKm));
}
export function itemFeeFor(itemCount: number, tier: number, distanceFee: number): number {
  if (!Number.isSafeInteger(itemCount) || itemCount < 1) throw new Error("Invalid item count");
  if (itemCount <= DELIVERY_PRICING.freeItemCount) return 0;
  return tier === 1 ? DELIVERY_PRICING.extraItemFeeFirstTier
    : roundUpHalf(distanceFee * DELIVERY_PRICING.extraItemFeeOtherRate);
}
export function calculateDeliveryFee(
  restaurant: Coordinates | null | undefined,
  customer: Coordinates | null | undefined,
  itemCount: number,
): DeliveryQuote {
  if (!valid(restaurant) || !valid(customer)) return { ok: false, reason: "missing_location" };
  if (!isInsideDeliveryArea(customer)) return { ok: false, reason: "outside_area" };
  const town = nearestTown(customer);
  const distanceKm = roadKm(restaurant, town);
  const tier = tierFor(distanceKm);
  if (!tier) return { ok: false, reason: "too_far", distanceKm };
  const distanceFromTownKm = roadKm(customer, town);
  const extraFee = extraFeeFor(distanceFromTownKm);
  const distanceFee = tier.fee + extraFee;
  const itemFee = itemFeeFor(itemCount, tier.tier, distanceFee);
  return { ok: true, town: town.name, zone: deliveryZone(customer), tier: tier.tier,
    distanceKm, townFee: tier.fee, distanceFromTownKm, extraFee,
    distanceFee, itemFee, fee: distanceFee + itemFee };
}
export function townPriceRanges(restaurant: Coordinates | null | undefined) {
  if (!valid(restaurant)) return [];
  return DELIVERY_GEOGRAPHY.towns.flatMap(town => {
    const distanceKm = roadKm(restaurant, town);
    const tier = tierFor(distanceKm);
    return tier ? [{ town: town.name, tier: tier.tier, distanceKm,
      minFee: tier.fee, maxFee: tier.fee + TOWN_EXTRA.maxExtra }] : [];
  }).sort((a, b) => a.minFee - b.minFee || a.town.localeCompare(b.town));
}
