
import { Linking } from "react-native";

export type RiderWhatsAppOrder = {
  orderId: string;
  restaurant: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  total: number;
};

export function formatGhanaPhone(phoneNumber: string): string | null {
  let phone = phoneNumber.replace(/\D/g, "");

  if (phone.startsWith("00")) {
    phone = phone.slice(2);
  }

  if (phone.startsWith("0")) {
    phone = `233${phone.slice(1)}`;
  }

  return /^233\d{9}$/.test(phone) ? phone : null;
}

export async function messageRider(
  riderPhone: string,
  order: RiderWhatsAppOrder,
): Promise<void> {
  const phone = formatGhanaPhone(riderPhone);

  if (!phone) {
    throw new Error("Enter a valid Ghanaian rider phone number.");
  }

  const message = [
    "🚚 AKROBITE — DELIVERY ASSIGNMENT",
    "",
    `Order: #${order.orderId.slice(0, 6)}`,
    `Restaurant: ${order.restaurant ?? "Not specified"}`,
    "",
    "CUSTOMER DETAILS",
    `Name: ${order.customerName ?? "Not provided"}`,
    `Phone: ${order.customerPhone ?? "Not provided"}`,
    "",
    "DELIVERY DETAILS",
    `Address: ${order.deliveryAddress ?? "Not provided"}`,
    `Order total: GH₵${Number(order.total).toFixed(2)}`,
    "",
    "Please confirm whether you can deliver this order.",
  ].join("\n");

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  await Linking.openURL(url);
}