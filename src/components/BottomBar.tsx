import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// A bar fixed to the bottom of a screen (Checkout, Pay, Continue...).
//
// Modern phones draw the app edge to edge, underneath the Android navigation
// buttons and the iPhone home bar. A bar placed at "bottom: 0" with a fixed
// padding then sits under those, and taps on its button go to the phone's
// own controls instead of the app. This bar adds the phone's real bottom
// space, so the button is always above it.
//
// (CSS values such as "max(30px, env(safe-area-inset-bottom))" only work on
// the web. On a phone they are invalid and the padding is lost.)

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function BottomBar({ children, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pt-3"
      style={[
        {
          paddingBottom: Math.max(insets.bottom, 12) + 12,
          // Keeps the bar above the scrolling content on Android.
          elevation: 8,
          zIndex: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
