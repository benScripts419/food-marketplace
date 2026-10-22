import type { Coordinates } from "./deliveryPricing.ts";

/* =========================================================
   Where each restaurant is (the red pins from your map).

   A cart item only carries the restaurant's NAME, so we match
   on the name, ignoring capitals, spaces and punctuation
   ("Roll'd Up" and "rolld up" are the same restaurant).

   If checkout says "We can't price delivery from X yet", the
   name in your app doesn't match one below: add it here.
   ========================================================= */

const RESTAURANT_LOCATIONS: { name: string; latitude: number; longitude: number }[] = [
  { name: "Kwayisibea Hotel", latitude: 5.953228, longitude: -0.102554 },
  { name: "50 cent", latitude: 5.969534, longitude: -0.090416 },
  { name: "lizjay's eatery", latitude: 5.969975, longitude: -0.090224 },
  { name: "concept", latitude: 5.965094, longitude: -0.095873 },
  { name: "bloombakes", latitude: 5.969285, longitude: -0.090553 },
  { name: "pam's check check", latitude: 5.969823, longitude: -0.089948 },
  { name: "brackers", latitude: 5.970723, longitude: -0.089518 },
  { name: "roll'd up", latitude: 5.969198, longitude: -0.090575 },
];

function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getRestaurantLocation(restaurantName: string): Coordinates | null {
  const wanted = normalise(restaurantName);

  if (!wanted) return null;

  const exact = RESTAURANT_LOCATIONS.find((r) => normalise(r.name) === wanted);
  if (exact) return { latitude: exact.latitude, longitude: exact.longitude };

  // Looser match, e.g. "Roll'd Up Akropong" still finds "roll'd up".
  if (wanted.length >= 4) {
    const loose = RESTAURANT_LOCATIONS.find((r) => {
      const known = normalise(r.name);
      return wanted.includes(known) || known.includes(wanted);
    });

    if (loose) return { latitude: loose.latitude, longitude: loose.longitude };
  }

  return null;
}