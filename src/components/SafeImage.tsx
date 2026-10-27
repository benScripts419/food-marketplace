import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, View } from "react-native";

// A picture in a box that keeps its shape on every screen size.
// If the picture is missing or fails to load, an icon is shown instead,
// and the address that failed is logged to the browser console.
export default function SafeImage({
  source,
  aspectRatio = 16 / 10,
  label,
  fit = "cover",
  backgroundColor = "#F5F5F5",
  radius = 0,
}: {
  source: any;
  aspectRatio?: number;
  label?: string;
  fit?: "cover" | "contain";
  backgroundColor?: string;
  radius?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        aspectRatio,
        overflow: "hidden",
        borderRadius: radius,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {source && !failed ? (
        <Image
          source={source}
          accessibilityLabel={label}
          style={{ width: "100%", height: "100%" }}
          resizeMode={fit}
          onError={() => {
            const resolved = (Image as any).resolveAssetSource?.(source);
            console.warn("Image failed to load:", resolved?.uri ?? source);
            setFailed(true);
          }}
        />
      ) : (
        <Ionicons name="image-outline" size={28} color="#A3A3A3" />
      )}
    </View>
  );
}
