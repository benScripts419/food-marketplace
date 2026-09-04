import { Text, TextInput, View } from "react-native";

type InputProps = {
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
};

export default function Input({
  label,
  placeholder,
  secureTextEntry,
}: InputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-text">{label}</Text>

      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        className="h-[52px] rounded-xl border border-border bg-white px-4 text-base text-text"
        placeholderTextColor="#737373"
      />
    </View>
  );
}
