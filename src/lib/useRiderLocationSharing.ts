import * as Location from "expo-location";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { Coordinates } from "@/lib/deliveryLocation";

type RiderLocationSharingState = {
  orderId: string | null;
  riderLocation: Coordinates | null;
  error: string | null;
};

export function useRiderLocationSharing(
  orderId: string | undefined,
  isActive: boolean,
): RiderLocationSharingState {
  const [sharingState, setSharingState] = useState<RiderLocationSharingState>({
    orderId: null,
    riderLocation: null,
    error: null,
  });
  const sharingKey = orderId && isActive ? orderId : null;

  useEffect(() => {
    if (!orderId || !isActive) {
      return;
    }
    const activeOrderId = orderId;

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    async function startSharing() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Sign in to share your delivery location.");

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error(
          "Allow location access while using the app so the customer can track this delivery.",
        );
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (position) => {
          if (cancelled) return;
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          const { error: saveError } = await supabase
            .from("order_rider_locations")
            .upsert(
              {
                order_id: activeOrderId,
                rider_id: user.id,
                ...coordinates,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "order_id" },
            );

          if (saveError) {
            console.error("Failed to share rider location:", saveError);
            if (!cancelled) {
              setSharingState({
                orderId: activeOrderId,
                riderLocation: coordinates,
                error: "Unable to share your location with the customer.",
              });
            }
          } else if (!cancelled) {
            setSharingState({
              orderId: activeOrderId,
              riderLocation: coordinates,
              error: null,
            });
          }
        },
        (locationError) => {
          console.error("Rider location update failed:", locationError);
          if (!cancelled) {
            setSharingState({
              orderId: activeOrderId,
              riderLocation: null,
              error: "Your live location is temporarily unavailable.",
            });
          }
        },
      );

      if (cancelled) {
        subscription.remove();
        subscription = null;
      }
    }

    void startSharing().catch((sharingError: unknown) => {
      console.error("Could not start rider location sharing:", sharingError);
      if (!cancelled) {
        setSharingState({
          orderId: activeOrderId,
          riderLocation: null,
          error:
            sharingError instanceof Error
              ? sharingError.message
              : "Could not start location sharing.",
        });
      }
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [isActive, orderId]);

  if (!sharingKey || sharingState.orderId !== sharingKey) {
    return { orderId: sharingKey, riderLocation: null, error: null };
  }
  return sharingState;
}
