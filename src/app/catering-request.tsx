import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Alert } from "@/lib/dialog";
import { supabase } from "@/lib/supabase";

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "number-pad";
  multiline?: boolean;
  optional?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline,
  optional,
}: FieldProps) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 text-sm font-semibold text-text">
        {label}
        {optional ? (
          <Text className="font-normal text-textSecondary"> (optional)</Text>
        ) : null}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A3A3A3"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className="rounded-xl border border-border bg-surface px-4 text-sm text-text"
        style={{
          minHeight: multiline ? 110 : 48,
          paddingTop: multiline ? 12 : 0,
        }}
      />
    </View>
  );
}

function createRequestId(): string {
  const bytes = new Uint8Array(16);
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    // Fallback for runtimes without Web Crypto; this is only a record UUID.
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  // Mark the value as a standard UUID v4.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export default function CateringRequestScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prefill the name from the signed-in account when available.
  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn("Could not load catering form session:", error.message);
        return;
      }
      const metadata = session?.user?.user_metadata ?? {};
      const fullName = metadata.full_name || metadata.name;
      if (active && fullName) setName(String(fullName));
    });

    return () => {
      active = false;
    };
  }, []);

  const submit = async () => {
    if (submitting) return;

    if (!name.trim() || !phone.trim() || !eventType.trim() || !guests.trim()) {
      Alert.alert(
        "Missing details",
        "Please add your name, phone number, event type and number of guests.",
      );
      return;
    }

    const guestCount = Number(guests.trim());
    if (!Number.isSafeInteger(guestCount) || guestCount < 1) {
      Alert.alert("Check guests", "Enter a valid whole number of guests.");
      return;
    }

    const trimmedDate = eventDate.trim();
    if (trimmedDate && !isValidDate(trimmedDate)) {
      Alert.alert(
        "Check date",
        "Use a valid date in YYYY-MM-DD format, e.g. 2026-12-20.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn("Could not read current session:", sessionError.message);
      }

      const requestId = createRequestId();

      // These column names match the existing public.catering_requests table.
      const { error: insertError } = await supabase
        .from("catering_requests")
        .insert({
          id: requestId,
          user_id: session?.user?.id ?? null,
          name: name.trim(),
          phone: phone.trim(),
          email: session?.user?.email ?? null,
          event_type: eventType.trim(),
          event_date: trimmedDate || null,
          guests: guestCount,
          location: location.trim() || null,
          details: details.trim() || null,
          status: "new",
        });

      if (insertError) throw insertError;

      // The DB trigger immediately creates the in-app admin notification.
      // This function sends the email and records whether it succeeded.
      const { data: notifyData, error: notifyError } =
        await supabase.functions.invoke("notify-catering-admin", {
          body: { requestId },
        });

      const emailSent = !notifyError && notifyData?.emailSent === true;
      if (notifyError) {
        console.error(
          "Catering request saved, but admin email invocation failed:",
          notifyError,
        );
      } else if (!emailSent) {
        console.warn(
          "Catering request saved; email delivery not confirmed:",
          notifyData,
        );
      }

      Alert.alert(
        "Request submitted",
        emailSent
          ? "Your catering request is saved. The BestPoint team has been notified in the admin dashboard and by email."
          : "Your catering request is saved and an in-app admin notification has been created. Email delivery could not be confirmed yet.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (error: unknown) {
      console.error("Catering request submission failed:", error);
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown error";

      Alert.alert(
        "Could not send request",
        `Your request could not be saved. Please check your connection and try again. (${message})`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="w-full max-w-[700px] self-center px-5 pt-16">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>
          <Text className="mt-5 text-2xl font-extrabold text-text">
            Request catering
          </Text>

          <Text className="mt-1 text-sm leading-5 text-textSecondary">
            Tell BestPoint Catering about your event. The team will contact you
            to agree on the menu, price and delivery.
          </Text>

          <Field label="Your name" value={name} onChangeText={setName} />

          <Field
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 024 000 0000"
          />

          <Field
            label="Type of event"
            value={eventType}
            onChangeText={setEventType}
            placeholder="Wedding, birthday, funeral, office lunch"
          />

          <Field
            label="Event date"
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="YYYY-MM-DD"
            optional
          />

          <Field
            label="Number of guests"
            value={guests}
            onChangeText={setGuests}
            keyboardType="number-pad"
            placeholder="e.g. 80"
          />

          <Field
            label="Event location"
            value={location}
            onChangeText={setLocation}
            placeholder="Town and venue"
            optional
          />

          <Field
            label="Anything else we should know?"
            value={details}
            onChangeText={setDetails}
            placeholder="Menu ideas, dietary needs, budget"
            multiline
            optional
          />

          <TouchableOpacity
            onPress={() => void submit()}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Send catering request"
            className="mt-8 items-center rounded-2xl bg-primary py-4"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            <Text className="text-base font-bold text-white">
              {submitting ? "Sending..." : "Send request"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
