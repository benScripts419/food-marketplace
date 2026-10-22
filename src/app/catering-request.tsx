import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function CateringRequestScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prefill the name from the signed-in account.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      const meta = session?.user?.user_metadata ?? {};
      const full = meta.full_name || meta.name;
      if (full) setName(String(full));
    });
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

    const guestCount = parseInt(guests, 10);
    if (!Number.isFinite(guestCount) || guestCount < 1) {
      Alert.alert("Check guests", "Enter the number of guests as a number.");
      return;
    }

    if (eventDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate.trim())) {
      Alert.alert("Check date", "Use the format YYYY-MM-DD, e.g. 2026-12-20.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error } = await supabase.from("catering_requests").insert({
        user_id: session?.user?.id ?? null,
        name: name.trim(),
        phone: phone.trim(),
        email: session?.user?.email ?? null,
        event_type: eventType.trim(),
        event_date: eventDate.trim() || null,
        guests: guestCount,
        location: location.trim() || null,
        details: details.trim() || null,
      });

      if (error) throw error;

      Alert.alert(
        "Request sent",
        "BestPoint Catering has your details and will contact you to arrange everything.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (error: any) {
      console.error("Catering request failed:", {
        message: error?.message,
        details: error?.details,
        code: error?.code,
      });

      Alert.alert(
        "Could not send request",
        "Check your connection and try again.",
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
            <Ionicons name="chevron-back" size={22} color="#171717" />
          </Pressable>

          <Text className="mt-5 text-2xl font-extrabold text-text">
            Request catering
          </Text>

          <Text className="mt-1 text-sm leading-5 text-textSecondary">
            Tell BestPoint Catering about your event. The team will call you to
            agree the menu, price and delivery.
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
