import AsyncStorage from "@react-native-async-storage/async-storage";

/* =========================================================
   Customer contact details collected at checkout.
   The rider needs a phone that can actually be reached, so
   the number must be a valid Ghana number before the customer
   can continue to payment.
   ========================================================= */

const STORAGE_KEY = "@akrobite_customer_details";

export type CustomerDetails = {
  name: string;
  phone: string;
  altPhone: string; // optional second number
};

export type CustomerDetailErrors = {
  name?: string;
  phone?: string;
  altPhone?: string;
};

/**
 * Turns what the customer typed into +233XXXXXXXXX, or null if it isn't a
 * valid Ghana number. Accepts 024 123 4567, 0241234567, 233241234567,
 * +233 24 123 4567 and 241234567.
 */
export function normalisePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);

  let national: string;

  if (digits.startsWith("233") && digits.length === 12) {
    national = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 10) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  } else {
    return null;
  }

  // Ghana numbers start 02x / 03x / 05x once the leading 0 is removed.
  if (!/^[235]\d{8}$/.test(national)) return null;

  return `+233${national}`;
}

export function validateCustomerDetails(
  input: CustomerDetails,
):
  | { ok: true; details: CustomerDetails }
  | { ok: false; errors: CustomerDetailErrors } {
  const errors: CustomerDetailErrors = {};

  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 2) {
    errors.name = "Please enter your full name.";
  }

  const phone = normalisePhone(input.phone);
  if (!input.phone.trim()) {
    errors.phone = "Enter a phone number our rider can call.";
  } else if (!phone) {
    errors.phone = "Enter a valid Ghana number, e.g. 024 123 4567.";
  }

  let altPhone = "";
  if (input.altPhone.trim()) {
    const alt = normalisePhone(input.altPhone);

    if (!alt) {
      errors.altPhone = "Enter a valid Ghana number, or leave this empty.";
    } else if (alt !== phone) {
      altPhone = alt; // same as the main number: just ignore it
    }
  }

  if (Object.keys(errors).length > 0 || !phone) {
    return { ok: false, errors };
  }

  return { ok: true, details: { name, phone, altPhone } };
}

export async function loadCustomerDetails(): Promise<CustomerDetails | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === "object") {
      const saved = parsed as Record<string, unknown>;

      return {
        name: typeof saved.name === "string" ? saved.name : "",
        phone: typeof saved.phone === "string" ? saved.phone : "",
        altPhone: typeof saved.altPhone === "string" ? saved.altPhone : "",
      };
    }
  } catch (error) {
    console.error("Could not load customer details:", error);
  }

  return null;
}

export async function saveCustomerDetails(details: CustomerDetails) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch (error) {
    console.error("Could not save customer details:", error);
  }
}