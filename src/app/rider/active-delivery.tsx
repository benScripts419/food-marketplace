import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

type RiderLocation = {
  latitude: number;
  longitude: number;
};

const deliveries = {
  "1001": {
    id: "1001",
    restaurant: "Mama's Kitchen",
    restaurantAddress: "Akropong Market",
    customer: "Customer",
    customerAddress: "Akropong, Ghana",
    phone: "+233 20 000 0000",
    items: "Jollof Rice with Chicken × 2",
    earnings: "GH₵15.00",
    distanceToRestaurant: "1.2 km",
    distanceToCustomer: "2.4 km",
    restaurantTime: "5–8 min",
    customerTime: "10–15 min",

    // Demo coordinates.
    // Replace these with your real restaurant/customer coordinates
    // when you connect your backend.
    restaurantLocation: {
      latitude: 5.7876,
      longitude: -0.2558,
    },

    customerLocation: {
      latitude: 5.8025,
      longitude: -0.2445,
    },
  },

  "1002": {
    id: "1002",
    restaurant: "Pizzamania",
    restaurantAddress: "Akropong",
    customer: "Customer",
    customerAddress: "Akuapem, Ghana",
    phone: "+233 24 000 0000",
    items: "Pepperoni Pizza × 1",
    earnings: "GH₵20.00",
    distanceToRestaurant: "1.5 km",
    distanceToCustomer: "3.8 km",
    restaurantTime: "5–10 min",
    customerTime: "15–20 min",

    restaurantLocation: {
      latitude: 5.79,
      longitude: -0.25,
    },

    customerLocation: {
      latitude: 5.805,
      longitude: -0.24,
    },
  },
};

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const mapRef = useRef<MapView | null>(null);

  const [pickedUp, setPickedUp] = useState(false);

  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(
    null,
  );

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState<string | null>(null);

  const delivery =
    deliveries[id as keyof typeof deliveries] ?? deliveries["1001"];

  /*
   * GET RIDER GPS LOCATION
   */
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function startLocationTracking() {
      try {
        setLocationLoading(true);
        setLocationError(null);

        /*
         * Ask the rider for foreground location permission.
         */
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationError(
            "Location permission is required to track your delivery.",
          );

          Alert.alert(
            "Location Required",
            "Please allow AkroBite to access your location so we can track your delivery.",
          );

          setLocationLoading(false);
          return;
        }

        /*
         * Get the rider's current position immediately.
         */
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const initialPosition = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setRiderLocation(initialPosition);
        setLocationLoading(false);

        /*
         * Continue watching the rider's location.
         */
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 3000,
          },
          (location) => {
            const newPosition = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };

            setRiderLocation(newPosition);

            /*
             * Keep the map centered around the rider.
             */
            mapRef.current?.animateToRegion(
              {
                latitude: newPosition.latitude,
                longitude: newPosition.longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              },
              500,
            );
          },
        );
      } catch (error) {
        console.error("Location tracking error:", error);

        setLocationError("Unable to get your current location.");

        setLocationLoading(false);
      }
    }

    startLocationTracking();

    /*
     * Stop GPS tracking when leaving the screen.
     */
    return () => {
      subscription?.remove();
    };
  }, []);

  /*
   * MOVE MAP TO RIDER
   */
  const centerOnRider = () => {
    if (!riderLocation) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: riderLocation.latitude,
        longitude: riderLocation.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      500,
    );
  };

  /*
   * PICKUP
   */
  const handlePickup = () => {
    setPickedUp(true);
  };

  /*
   * DELIVERY COMPLETED
   */
  const handleDelivered = () => {
    router.push({
      pathname: "/rider/delivery-completed",
      params: {
        id: delivery.id,
      },
    });
  };

  /*
   * MAP ROUTE
   *
   * This is still a simple straight-line demo route.
   * Later we can replace it with a real road route
   * from Google Directions / another routing service.
   */
  const routeCoordinates = riderLocation
    ? [
        riderLocation,
        pickedUp ? delivery.customerLocation : delivery.restaurantLocation,
      ]
    : [delivery.restaurantLocation, delivery.customerLocation];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
      >
        {/* MAP */}
        <View className="h-[330px] w-full">
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{
              width: "100%",
              height: "100%",
            }}
            initialRegion={{
              latitude:
                riderLocation?.latitude ?? delivery.restaurantLocation.latitude,

              longitude:
                riderLocation?.longitude ??
                delivery.restaurantLocation.longitude,

              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            zoomEnabled
            rotateEnabled
            scrollEnabled
          >
            {/* RIDER */}
            {riderLocation && (
              <Marker
                coordinate={riderLocation}
                title="You"
                description="Your current location"
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-white shadow">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                    <Ionicons name="bicycle" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </Marker>
            )}

            {/* RESTAURANT */}
            <Marker
              coordinate={delivery.restaurantLocation}
              title={delivery.restaurant}
              description={delivery.restaurantAddress}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-white shadow">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Ionicons name="restaurant" size={17} color="#FFFFFF" />
                </View>
              </View>
            </Marker>

            {/* CUSTOMER */}
            <Marker
              coordinate={delivery.customerLocation}
              title={delivery.customer}
              description={delivery.customerAddress}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-white shadow">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Ionicons name="location" size={17} color="#FFFFFF" />
                </View>
              </View>
            </Marker>

            {/* ROUTE */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#E53935"
              strokeWidth={5}
            />
          </MapView>

          {/* BACK BUTTON */}
          <Pressable
            onPress={() => router.back()}
            className="absolute left-5 top-14 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          {/* ORDER NUMBER */}
          <View className="absolute right-5 top-14 rounded-full bg-white px-4 py-2">
            <Text className="text-xs font-bold text-text">
              Order #{delivery.id}
            </Text>
          </View>

          {/* CENTER ON RIDER */}
          <Pressable
            onPress={centerOnRider}
            className="absolute bottom-5 right-5 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="locate" size={21} color="#E53935" />
          </Pressable>
        </View>

        {/* LOCATION STATUS */}
        <View className="mx-5 -mt-6 rounded-2xl bg-white p-5">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Ionicons
                name={
                  locationLoading
                    ? "locate-outline"
                    : locationError
                      ? "warning-outline"
                      : "navigate-outline"
                }
                size={22}
                color="#E53935"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs font-semibold text-primary">
                {locationLoading
                  ? "LOCATING YOU"
                  : locationError
                    ? "LOCATION UNAVAILABLE"
                    : "GPS ACTIVE"}
              </Text>

              <Text className="mt-1 text-base font-bold text-text">
                {locationLoading
                  ? "Getting your location..."
                  : locationError
                    ? "Check your location permission"
                    : pickedUp
                      ? delivery.customerAddress
                      : delivery.restaurant}
              </Text>

              {!locationLoading && !locationError && (
                <Text className="mt-1 text-xs text-textSecondary">
                  Your location is being updated automatically
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* DELIVERY PROGRESS */}
        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery progress</Text>

          {/* RESTAURANT */}
          <View className="mt-5 flex-row">
            <View className="items-center">
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  pickedUp ? "bg-success" : "bg-primary"
                }`}
              >
                <Ionicons
                  name={pickedUp ? "checkmark" : "restaurant-outline"}
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View className="h-10 w-px bg-border" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-bold text-text">{delivery.restaurant}</Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {pickedUp
                  ? "Order picked up"
                  : "Go to restaurant and collect order"}
              </Text>
            </View>
          </View>

          {/* CUSTOMER */}
          <View className="flex-row">
            <View className="items-center">
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  pickedUp ? "bg-primary" : "bg-surface"
                }`}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={pickedUp ? "#FFFFFF" : "#737373"}
                />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text
                className={`font-bold ${
                  pickedUp ? "text-text" : "text-textSecondary"
                }`}
              >
                Deliver to customer
              </Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {delivery.customerAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* ORDER DETAILS */}
        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-text">Order details</Text>

            <Text className="font-bold text-primary">{delivery.earnings}</Text>
          </View>

          <View className="mt-4">
            <Text className="text-xs text-textSecondary">ITEMS</Text>

            <Text className="mt-1 font-medium text-text">{delivery.items}</Text>
          </View>
        </View>

        {/* CUSTOMER */}
        {pickedUp && (
          <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
            <Text className="text-lg font-bold text-text">Customer</Text>

            <View className="mt-4 flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
                <Ionicons name="person-outline" size={21} color="#737373" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-bold text-text">{delivery.customer}</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  {delivery.phone}
                </Text>
              </View>

              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                <Ionicons name="call-outline" size={19} color="#E53935" />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM ACTION */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        {!pickedUp ? (
          <>
            <Pressable
              onPress={centerOnRider}
              className="mb-3 h-12 flex-row items-center justify-center rounded-xl border border-border bg-white"
            >
              <Ionicons name="locate-outline" size={19} color="#E53935" />

              <Text className="ml-2 font-bold text-primary">My Location</Text>
            </Pressable>

            <Pressable
              onPress={handlePickup}
              className="h-14 items-center justify-center rounded-xl bg-primary"
            >
              <Text className="text-base font-bold text-white">
                I've Picked Up Order
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={centerOnRider}
              className="mb-3 h-12 flex-row items-center justify-center rounded-xl border border-border bg-white"
            >
              <Ionicons name="locate-outline" size={19} color="#E53935" />

              <Text className="ml-2 font-bold text-primary">My Location</Text>
            </Pressable>

            <Pressable
              onPress={handleDelivered}
              className="h-14 items-center justify-center rounded-xl bg-primary"
            >
              <Text className="text-base font-bold text-white">
                Mark as Delivered
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
