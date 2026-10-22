import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
  DimensionValue,
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

// --------------------------------------------------
// PATTERN ICONS (cut from the uploaded food pattern)
// --------------------------------------------------

const ICONS = {
  bowlSteam: require("@/assets/images/pattern/bowl-steam.png"),
  egg: require("@/assets/images/pattern/egg.png"),
  burger: require("@/assets/images/pattern/burger.png"),
  noodleBowl: require("@/assets/images/pattern/noodle-bowl.png"),
  chopsticks: require("@/assets/images/pattern/chopsticks.png"),
  chili: require("@/assets/images/pattern/chili.png"),
  spoon: require("@/assets/images/pattern/spoon.png"),
  fork: require("@/assets/images/pattern/fork.png"),
  pizza: require("@/assets/images/pattern/pizza.png"),
  plate: require("@/assets/images/pattern/plate.png"),
} as const;

type IconKey = keyof typeof ICONS;

export type BackdropVariant = "promo" | "delivery" | "catering";

type Placed = {
  icon: IconKey;
  size: number;
  rotate: number;
  opacity?: number;
  top?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
};

// Every slide gets its own scatter so the carousel never repeats a layout.
// Icons under the text stay faint; the hero cluster on the right is full strength.
const SCATTER: Record<BackdropVariant, Placed[]> = {
  promo: [
    { icon: "pizza", size: 44, rotate: -10, top: 6, left: "3%" },
    { icon: "bowlSteam", size: 38, rotate: 8, top: 10, left: "42%" },
    { icon: "egg", size: 34, rotate: 14, bottom: 8, left: "8%" },
    { icon: "burger", size: 36, rotate: -14, bottom: 6, left: "38%" },
    { icon: "chili", size: 40, rotate: 20, top: 52, left: "24%" },
    { icon: "chopsticks", size: 36, rotate: 0, top: 4, right: "30%" },
    { icon: "plate", size: 34, rotate: 0, bottom: 4, right: "4%" },
  ],
  delivery: [
    { icon: "burger", size: 38, rotate: -16, top: 8, left: "4%" },
    { icon: "chili", size: 40, rotate: 24, bottom: 8, left: "10%" },
    { icon: "egg", size: 32, rotate: 10, top: 10, left: "40%" },
    { icon: "chopsticks", size: 38, rotate: 30, bottom: 6, left: "42%" },
    { icon: "pizza", size: 40, rotate: -8, top: 56, left: "26%" },
    { icon: "spoon", size: 40, rotate: 16, top: 4, right: "34%" },
  ],
  catering: [
    { icon: "fork", size: 44, rotate: -20, top: 6, left: "2%" },
    { icon: "plate", size: 34, rotate: 0, bottom: 8, left: "6%" },
    { icon: "bowlSteam", size: 38, rotate: -8, top: 8, left: "44%" },
    { icon: "egg", size: 32, rotate: 18, bottom: 8, left: "40%" },
    { icon: "chili", size: 38, rotate: -24, top: 54, left: "22%" },
    { icon: "pizza", size: 38, rotate: 10, bottom: 4, right: "38%" },
  ],
};

// --------------------------------------------------
// VIGNETTE: darker at the edges, fading toward the centre.
// A single radial gradient, so there are no bands or straight lines.
// Needs: npx expo install react-native-svg
// --------------------------------------------------

function Vignette({ edgeOpacity = 0.55 }: { edgeOpacity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          <RadialGradient
            id="vignette"
            cx="50"
            cy="50"
            r="50"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#3A0008" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#3A0008" stopOpacity="0" />
            <Stop
              offset="1"
              stopColor="#3A0008"
              stopOpacity={String(edgeOpacity)}
            />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#vignette)" />
      </Svg>
    </View>
  );
}

// --------------------------------------------------
// HERO CLUSTERS (right side of the delivery and catering slides)
// --------------------------------------------------

function Icon({ p }: { p: Placed }) {
  return (
    <Image
      source={ICONS[p.icon]}
      resizeMode="contain"
      style={{
        position: "absolute",
        width: p.size,
        height: p.size,
        top: p.top,
        bottom: p.bottom,
        left: p.left,
        right: p.right,
        opacity: p.opacity ?? 1,
        transform: [{ rotate: `${p.rotate}deg` }],
      }}
    />
  );
}

function Hero({ variant }: { variant: BackdropVariant }) {
  if (variant === "delivery") {
    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 130,
        }}
      >
        <Icon
          p={{ icon: "bowlSteam", size: 48, rotate: 12, top: 8, right: 8 }}
        />
        <Icon p={{ icon: "plate", size: 104, rotate: 0, top: 40, right: 12 }} />
        <View
          style={{
            position: "absolute",
            right: 82,
            top: 92,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="bicycle" size={28} color="#CC0A22" />
        </View>
      </View>
    );
  }

  if (variant === "catering") {
    return (
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 140,
        }}
      >
        <Icon p={{ icon: "spoon", size: 78, rotate: 18, top: 10, right: 6 }} />
        <Icon p={{ icon: "fork", size: 78, rotate: -14, top: 14, right: 40 }} />
        <Icon
          p={{ icon: "noodleBowl", size: 92, rotate: -6, bottom: 8, right: 22 }}
        />
      </View>
    );
  }

  return null;
}

// --------------------------------------------------
// BACKDROP
// --------------------------------------------------

export const PROMO_RED = "#D10F28";

// Faint icons scattered behind the text. Off for a clean red background.
const SHOW_SCATTER = false;

export default function PromoBackdrop({
  variant,
  height,
  style,
  children,
}: {
  variant: BackdropVariant;
  height: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        {
          height,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: PROMO_RED,
        },
        style,
      ]}
    >
      {/* faint scattered pattern (off by default; set SHOW_SCATTER to true) */}
      {SHOW_SCATTER ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {SCATTER[variant].map((p, i) => (
            <Icon key={i} p={{ ...p, opacity: p.opacity ?? 0.3 }} />
          ))}
        </View>
      ) : null}

      <Hero variant={variant} />

      {/* edges darker, centre lighter */}
      {/* <Vignette /> */}

      {/* content sits above the vignette so text stays crisp */}
      {children}
    </View>
  );
}
