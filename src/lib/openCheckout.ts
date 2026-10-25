import { Platform } from "react-native";

// Opens the Paystack payment page.
//
// On the web this moves the SAME browser tab to Paystack. Opening a new tab
// after waiting for the server is blocked by iPhone Safari (it only allows
// pop-ups that open straight from a tap), so the new-tab approach fails on
// iPhones. After paying, Paystack sends the customer back to the app's
// /payment-complete page, which confirms the payment.
//
// On a phone app the payment page is shown inside the app instead, so this
// does nothing there.
export function openCheckout(url: string): void {
  if (Platform.OS !== "web") return;

  const browser = globalThis as unknown as {
    location?: { assign: (target: string) => void };
  };

  browser.location?.assign(url);
}