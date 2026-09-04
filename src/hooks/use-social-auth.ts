import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  scheme: "foodmarketplace",
  path: "auth/callback",
});

type SocialProvider = "google" | "apple";

type AuthCallbackParams = {
  access_token?: string;
  refresh_token?: string;
  error_description?: string;
};

function getCallbackParams(url: string): AuthCallbackParams {
  const [urlWithoutHash, hash] = url.split("#");
  const query = urlWithoutHash.split("?")[1] ?? "";
  const searchParams = new URLSearchParams(`${query}&${hash ?? ""}`);

  return {
    access_token: searchParams.get("access_token") ?? undefined,
    refresh_token: searchParams.get("refresh_token") ?? undefined,
    error_description: searchParams.get("error_description") ?? undefined,
  };
}

export function useSocialAuth() {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const signInWithBrowser = async (provider: SocialProvider) => {
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) throw oauthError;
    if (!data.url) throw new Error("The authentication URL was not created.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    if (result.type !== "success") return false;

    const callbackParams = getCallbackParams(result.url);
    if (callbackParams.error_description) {
      throw new Error(callbackParams.error_description);
    }
    if (!callbackParams.access_token || !callbackParams.refresh_token) {
      throw new Error("Authentication did not return a valid session.");
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: callbackParams.access_token,
      refresh_token: callbackParams.refresh_token,
    });

    if (sessionError) throw sessionError;
    return true;
  };

  const signInWithApple = async () => {
    if (Platform.OS !== "ios") {
      return signInWithBrowser("apple");
    }

    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sign in with Apple is not available on this device.");
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("Apple did not return an identity token.");
    }

    const { error: sessionError } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });

    if (sessionError) throw sessionError;
    return true;
  };

  const run = async (provider: SocialProvider) => {
    setError(null);
    setLoadingProvider(provider);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          "Add your Supabase URL and anon key to the project's environment variables.",
        );
      }

      return provider === "apple"
        ? await signInWithApple()
        : await signInWithBrowser("google");
    } catch (authError) {
      if (
        authError instanceof Error &&
        authError.message.toLowerCase().includes("cancel")
      ) {
        return false;
      }

      setError(
        authError instanceof Error
          ? authError.message
          : "Unable to sign in right now.",
      );
      return false;
    } finally {
      setLoadingProvider(null);
    }
  };

  return {
    error,
    loadingProvider,
    signInWithApple: () => run("apple"),
    signInWithGoogle: () => run("google"),
  };
}
