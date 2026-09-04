import { Image, Text, View } from "react-native";

export default function Logo() {
  return (
    <View className="items-center">
      <Image
        source={require("../../../assets/images/akrobite-logo.png")}
        className="mb-0 h-40 w-40"
        resizeMode="contain"
      />

      <Text className="-mt-10 text-[13px] text-textSecondary">
        Good food, fast delivery
      </Text>
    </View>
  );
}
