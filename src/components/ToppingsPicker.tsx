import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import type { Topping } from "@/lib/toppings";

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

const normalizeName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

function isMilkOption(topping: Topping): boolean {
  return ["almondmilk", "freshmilk", "oatmilk", "oat"].includes(
    normalizeName(topping.name),
  );
}

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

  const milkOptions = toppings.filter(isMilkOption);
  const extraToppings = toppings.filter((topping) => !isMilkOption(topping));

  const selectedMilkId = selectedIds.find((id) =>
    milkOptions.some((option) => option.id === id),
  );

  const chosen = toppings.filter((topping) => selectedIds.includes(topping.id));

  const chosenExtras = chosen.filter((topping) => !isMilkOption(topping));

  const total =
    basePrice + chosen.reduce((sum, topping) => sum + topping.price, 0);

  const atLimit = chosenExtras.length >= MAX_TOPPINGS;

  useEffect(() => {
    if (visible) {
      setSelectedIds([]);
    }
  }, [visible, itemName]);

  const toggle = (topping: Topping) => {
    setSelectedIds((current) => {
      // Milk options are mutually exclusive.
      if (isMilkOption(topping)) {
        if (current.includes(topping.id)) {
          return current.filter((id) => id !== topping.id);
        }

        const withoutMilk = current.filter(
          (id) => !milkOptions.some((option) => option.id === id),
        );

        return [...withoutMilk, topping.id];
      }

      // Extra toppings can be selected independently.
      if (current.includes(topping.id)) {
        return current.filter((id) => id !== topping.id);
      }

      const selectedExtraCount = current.filter(
        (id) => !milkOptions.some((option) => option.id === id),
      ).length;

      if (selectedExtraCount >= MAX_TOPPINGS) {
        return current;
      }

      return [...current, topping.id];
    });
  };

  const renderOption = (topping: Topping, milkOption = false) => {
    const selected = selectedIds.includes(topping.id);
    const disabled = !milkOption && !selected && atLimit;

    return (
      <Pressable
        key={topping.id}
        onPress={() => toggle(topping)}
        disabled={disabled}
        accessibilityRole={milkOption ? "radio" : "checkbox"}
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={`${topping.name}, ${
          topping.price === 0 ? "free" : money(topping.price)
        }`}
        className={`mb-2 flex-row items-center rounded-xl border p-4 ${
          selected ? "border-primary bg-red-50" : "border-border bg-white"
        } ${disabled ? "opacity-40" : ""}`}
      >
        <Ionicons
          name={
            milkOption
              ? selected
                ? "radio-button-on"
                : "radio-button-off"
              : selected
                ? "checkbox"
                : "square-outline"
          }
          size={22}
          color={selected ? "#E53935" : "#737373"}
        />

        <Text className="ml-3 flex-1 text-sm font-semibold text-text">
          {topping.name}
        </Text>

        {topping.price > 0 && (
          <Text className="text-sm font-semibold text-text">
            +{money(topping.price)}
          </Text>
        )}
      </Pressable>
    );
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
          {/* Header */}
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
              hitSlop={10}
              className="h-9 w-9 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#171717" />
            </Pressable>
          </View>

          <ScrollView
            className="mt-4"
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Milk selection */}
            {milkOptions.length > 0 && (
              <View>
                <Text className="text-sm font-bold text-text">
                  Milk Options
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Choose one option. Optional.
                </Text>

                <View className="mt-3">
                  {milkOptions.map((topping) => renderOption(topping, true))}
                </View>
              </View>
            )}

            {/* Extra toppings */}
            {extraToppings.length > 0 && (
              <View className={milkOptions.length > 0 ? "mt-4" : ""}>
                <Text className="text-sm font-bold text-text">
                  Extra Toppings
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Optional. Choose up to {MAX_TOPPINGS}.
                </Text>

                <View className="mt-3">
                  {extraToppings.map((topping) => renderOption(topping))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Total and confirmation */}
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
