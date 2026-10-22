import { supabase } from "@/lib/supabase";

export async function registerCustomer(
  fullName: string,
  email: string,
  password: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!fullName.trim()) {
    throw new Error("Please enter your full name.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Signup failed: no user was returned.");
  }

  return {
    user: data.user,
    session: data.session,
    verificationRequired: !data.session,
  };
}