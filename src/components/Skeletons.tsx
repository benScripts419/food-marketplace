import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";

// --------------------------------------------------
// BASE BLOCK
// --------------------------------------------------

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== "web";

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 800,
          useNativeDriver,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: "#E5E5E5",
          opacity,
        },
        style,
      ]}
    />
  );
}

// --------------------------------------------------
// HOME: PROMOTION / FLYER CAROUSEL
// --------------------------------------------------

export function PromoSkeleton() {
  return <Skeleton height={190} radius={16} style={{ marginHorizontal: 20 }} />;
}

// --------------------------------------------------
// HOME: CATEGORY CIRCLES
// --------------------------------------------------

export function CategoriesSkeleton() {
  return (
    <View className="flex-row px-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} className="mr-4 items-center">
          <Skeleton width={64} height={64} radius={32} />
          <Skeleton width={40} height={10} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

// --------------------------------------------------
// HOME: POPULAR RESTAURANT CARD (w-56, h-72)
// --------------------------------------------------

export function RestaurantCardSkeleton() {
  return (
    <View className="mr-4 w-56 overflow-hidden rounded-2xl">
      <Skeleton height={288} radius={16} />
    </View>
  );
}

// --------------------------------------------------
// RESTAURANTS SCREEN: LIST ROW
// --------------------------------------------------

export function RestaurantRowSkeleton() {
  return (
    <View className="mb-4 flex-row rounded-2xl border border-border bg-white p-2">
      <Skeleton width={105} height={105} radius={12} />

      <View className="ml-3 flex-1 py-1">
        <Skeleton width="60%" height={16} />
        <Skeleton width="30%" height={12} style={{ marginTop: 10 }} />
        <Skeleton width="55%" height={12} style={{ marginTop: 12 }} />
        <Skeleton width="40%" height={12} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}
