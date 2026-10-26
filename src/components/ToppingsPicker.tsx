import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import type { Topping } from "@/lib/toppings";

// The most toppings one drink can have.
export const MAX_TOPPINGS = 5;

const money = (value: number) => `GH₵${value.toFixed(2)}`;

type Props = {
  visible: boolean;
  itemName: string;
  itemDetail?: string | null;
  basePrice: number;
  toppings: Topping[];
  onClose: () => void;
  onConfirm: (chosen: Topping[]) => void;
};

export default function ToppingsPicker({
  visible,
  itemName,
  itemDetail,
  basePrice,
  toppings,
  onClose,
  onConfirm,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Start with nothing ticked each time the window opens.
  useEffect(() => {
    if (visible) setSelectedIds([]);
  }, [visible]);

  const chosen = toppings.filter((topping) => selectedIds.includes(topping.id));
  const total = basePrice + chosen.reduce((sum, t) => sum + t.price, 0);
  const atLimit = selectedIds.length >= MAX_TOPPINGS;

  const toggle = (topping: Topping) => {
    setSelectedIds((current) => {
      if (current.includes(topping.id)) {
        return current.filter((id) => id !== topping.id);
      }

      if (current.length >= MAX_TOPPINGS) return current;

      return [...current, topping.id];
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[80%] rounded-t-3xl bg-white px-5 pb-8 pt-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-bold text-text" numberOfLines={2}>
                {itemName}
              </Text>
              <Text className="mt-1 text-xs text-textSecondary">
                {itemDetail ? `${itemDetail} · ` : ""}
                {money(basePrice)}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-9 w-9 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#171717" />
            </Pressable>
          </View>

          <Text className="mt-4 text-sm font-bold text-text">
            Extra toppings
          </Text>
          <Text className="mt-1 text-xs text-textSecondary">
            Optional. Choose up to {MAX_TOPPINGS}.
          </Text>

          <ScrollView
            className="mt-3"
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
          >
            {toppings.map((topping) => {
              const selected = selectedIds.includes(topping.id);
              const disabled = !selected && atLimit;

              return (
                <Pressable
                  key={topping.id}
                  onPress={() => toggle(topping)}
                  disabled={disabled}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected, disabled }}
                  className={`mb-2 flex-row items-center rounded-xl border p-4 ${
                    selected
                      ? "border-primary bg-red-50"
                      : "border-border bg-white"
                  } ${disabled ? "opacity-40" : ""}`}
                >
                  <Ionicons
                    name={selected ? "checkbox" : "square-outline"}
                    size={22}
                    color={selected ? "#E53935" : "#737373"}
                  />

                  <Text className="ml-3 flex-1 text-sm font-semibold text-text">
                    {topping.name}
                  </Text>

                  <Text className="text-sm font-semibold text-text">
                    {topping.price > 0 ? `+${money(topping.price)}` : "Free"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => onConfirm(chosen)}
            accessibilityRole="button"
            className="mt-4 h-14 flex-row items-center justify-center rounded-xl bg-primary"
          >
            <Text className="font-bold text-white">Add to cart</Text>
            <Text className="ml-3 font-bold text-white">{money(total)}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
