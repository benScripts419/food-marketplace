import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable
      className="h-[52px] w-full items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark"
      onPress={onPress}
    >
      <Text className="text-[15px] font-bold text-white">{title}</Text>
    </Pressable>
  );
}
