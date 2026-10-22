import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import PromoBackdrop from "@/components/PromoBackdrop";
import { PromoSkeleton } from "@/components/Skeletons";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type Promotion = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  discount_text: string | null;
  button_text: string | null;
  image_url: string | null;
  restaurant_id: string | null;
  day_of_week: number | null;
  start_date: string | null;
  end_date: string | null;
};

type SlideId = "promotion" | "delivery" | "catering";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const MAX_CONTENT_WIDTH = 1100;
const SLIDE_GAP = 12;
const SLIDE_HEIGHT = 160;
const AUTO_SCROLL_MS = 4000;
const RESUME_AFTER_MS = 5000;

const bestPointLogo = require("@/assets/images/bestpoint-logo.jpg");

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function HomeCarousel({
  promotion,
  loading,
}: {
  promotion: Promotion | null;
  loading: boolean;
}) {
  const { width: screenWidth } = useWindowDimensions();

  const carouselRef = useRef<ScrollView>(null);
  const activeSlideRef = useRef(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentWidth = Math.min(screenWidth, MAX_CONTENT_WIDTH);
  const slideWidth = Math.max(280, contentWidth - 40);
  const slideInterval = slideWidth + SLIDE_GAP;

  const slides = useMemo<SlideId[]>(
    () => [
      ...(promotion ? (["promotion"] as const) : []),
      "delivery",
      "catering",
    ],
    [promotion],
  );

  const isPromotionDay = promotion?.day_of_week === new Date().getDay();

  // ---------------- auto-scroll control ----------------

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const resumeAutoScroll = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_MS);
  };

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  // Keep the index valid if the promotion loads or disappears.
  useEffect(() => {
    const validIndex = Math.min(activeSlideRef.current, slides.length - 1);

    activeSlideRef.current = validIndex;
    setActiveSlide(validIndex);

    carouselRef.current?.scrollTo({
      x: validIndex * slideInterval,
      animated: false,
    });
  }, [slides.length, slideInterval]);

  useEffect(() => {
    if (slides.length < 2 || loading) return;

    const timer = setInterval(() => {
      if (pausedRef.current) return;

      const next = (activeSlideRef.current + 1) % slides.length;

      activeSlideRef.current = next;
      setActiveSlide(next);

      carouselRef.current?.scrollTo({
        x: next * slideInterval,
        animated: true,
      });
    }, AUTO_SCROLL_MS);

    return () => clearInterval(timer);
  }, [slides.length, loading, slideInterval]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.max(
      0,
      Math.min(
        Math.round(e.nativeEvent.contentOffset.x / slideInterval),
        slides.length - 1,
      ),
    );

    activeSlideRef.current = index;
    setActiveSlide(index);
  };

  const goToSlide = (index: number) => {
    pauseAutoScroll();
    resumeAutoScroll();

    activeSlideRef.current = index;
    setActiveSlide(index);

    carouselRef.current?.scrollTo({
      x: index * slideInterval,
      animated: true,
    });
  };

  // ---------------- slides ----------------

  const renderSlide = (id: SlideId) => {
    if (id === "promotion" && promotion) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (promotion.restaurant_id) {
              router.push(`/restaurant/${promotion.restaurant_id}`);
            }
          }}
        >
          <PromoBackdrop variant="promo" height={SLIDE_HEIGHT}>
            <View className="flex-1 flex-row items-center px-5 py-4">
              <View className="flex-1">
                {promotion.subtitle ? (
                  <Text
                    className="text-xs font-semibold text-white"
                    numberOfLines={1}
                  >
                    {promotion.subtitle}
                  </Text>
                ) : null}

                <Text
                  className="mt-1 text-2xl font-extrabold text-white"
                  numberOfLines={2}
                >
                  {promotion.discount_text || promotion.title}
                </Text>

                {promotion.description ? (
                  <Text
                    className="mt-1 text-xs leading-5 text-white"
                    numberOfLines={2}
                  >
                    {promotion.description}
                  </Text>
                ) : null}

                <View className="mt-3 self-start rounded-lg bg-white px-4 py-2">
                  <Text className="text-xs font-bold text-primary">
                    {isPromotionDay
                      ? promotion.button_text || "Order Now"
                      : "See Restaurant"}
                  </Text>
                </View>
              </View>

              {promotion.image_url ? (
                <Image
                  source={{ uri: promotion.image_url }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    marginLeft: 12,
                    borderWidth: 3,
                    borderColor: "#ffffff",
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View className="ml-3 h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
                  <Text className="text-5xl">🌯</Text>
                </View>
              )}
            </View>
          </PromoBackdrop>
        </TouchableOpacity>
      );
    }

    if (id === "delivery") {
      return (
        <TouchableOpacity
          activeOpacity={0.92}
          accessibilityRole="button"
          accessibilityLabel="Request a delivery"
          onPress={() => router.push("/delivery-request")}
        >
          <PromoBackdrop variant="delivery" height={SLIDE_HEIGHT}>
            <View
              className="flex-1 justify-center px-5"
              style={{ paddingRight: 140 }}
            >
              <Text
                className="text-2xl font-extrabold text-white"
                numberOfLines={1}
              >
                Need a delivery?
              </Text>

              <Text
                className="mt-1 text-xs leading-5 text-white"
                numberOfLines={2}
              >
                Already ordered from a restaurant? Let AkroBite bring it to you.
              </Text>

              <Text
                className="mt-1 text-[11px] text-white/80"
                numberOfLines={1}
              >
                A service fee applies.
              </Text>

              <View className="mt-3 self-start rounded-lg bg-white px-4 py-2">
                <Text className="text-xs font-bold text-primary">
                  Request delivery
                </Text>
              </View>
            </View>
          </PromoBackdrop>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel="BestPoint Catering Services. Request catering"
        onPress={() => router.push("/catering-request")}
      >
        <PromoBackdrop variant="catering" height={SLIDE_HEIGHT}>
          <View
            className="flex-1 justify-center px-5"
            style={{ paddingRight: 150 }}
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  source={bestPointLogo}
                  resizeMode="contain"
                  style={{ width: 38, height: 38 }}
                />
              </View>

              <Text
                className="ml-3 flex-1 text-lg font-extrabold text-white"
                numberOfLines={2}
              >
                BestPoint Catering
              </Text>
            </View>

            <Text
              className="mt-2 text-xs leading-5 text-white"
              numberOfLines={2}
            >
              Planning an event? Tell us what you need and we will reach out.
            </Text>

            <View className="mt-3 self-start rounded-lg bg-white px-4 py-2">
              <Text className="text-xs font-bold text-primary">
                Request catering
              </Text>
            </View>
          </View>
        </PromoBackdrop>
      </TouchableOpacity>
    );
  };

  // ---------------- render ----------------

  if (loading) return <PromoSkeleton />;

  return (
    <>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={slideInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={pauseAutoScroll}
        onScrollEndDrag={resumeAutoScroll}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        style={{ flexGrow: 0 }}
      >
        {slides.map((id) => (
          <View key={id} style={{ width: slideWidth, marginRight: SLIDE_GAP }}>
            {renderSlide(id)}
          </View>
        ))}
      </ScrollView>

      {slides.length > 1 ? (
        <View className="mt-3 flex-row justify-center">
          {slides.map((id, index) => (
            <TouchableOpacity
              key={id}
              onPress={() => goToSlide(index)}
              accessibilityRole="button"
              accessibilityLabel={`Show carousel slide ${index + 1}`}
              style={{
                width: activeSlide === index ? 20 : 7,
                height: 7,
                borderRadius: 5,
                marginHorizontal: 4,
                backgroundColor: activeSlide === index ? "#E53935" : "#D4D4D4",
              }}
            />
          ))}
        </View>
      ) : null}
    </>
  );
}
