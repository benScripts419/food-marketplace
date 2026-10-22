import { View } from "react-native";

const LAYERS = 40;

type BottomFadeProps = {
  // Total darkness at the very bottom
  maxOpacity?: number;
};

// Fills its parent: transparent at the top, dark at the bottom.
// Each layer covers from its own start point down to the bottom, so there are
// no seams between layers, and each step is only a faint tint.
export default function BottomFade({ maxOpacity = 0.88 }: BottomFadeProps) {
  // Per-layer alpha so that all layers together reach maxOpacity at the bottom
  const alpha = 1 - Math.pow(1 - maxOpacity, 1 / LAYERS);

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {Array.from({ length: LAYERS }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: `${(i / LAYERS) * 100}%`,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0,0,0,${alpha.toFixed(4)})`,
          }}
        />
      ))}
    </View>
  );
}
