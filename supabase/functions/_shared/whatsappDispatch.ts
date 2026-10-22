const DISPATCH_PHONE_NUMBER = "233243571180";

function normalizePhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 && digits.startsWith("0")
    ? `233${digits.slice(1)}`
    : digits;
}

export async function verifyDispatchSender(
  phoneNumberId: string,
  accessToken: string,
) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    const details = await response.text();
    console.error("Could not verify the WhatsApp dispatch sender:", details);
    throw new Error("Could not verify the configured WhatsApp sender.");
  }

  const data: unknown = await response.json();
  const displayPhoneNumber =
    data && typeof data === "object" && "display_phone_number" in data
      ? data.display_phone_number
      : null;
  if (
    typeof displayPhoneNumber !== "string" ||
    normalizePhoneNumber(displayPhoneNumber) !== DISPATCH_PHONE_NUMBER
  ) {
    throw new Error(
      "WhatsApp dispatch must use 0243571180. Set WHATSAPP_PHONE_NUMBER_ID to this number's Meta phone-number ID.",
    );
  }
}
