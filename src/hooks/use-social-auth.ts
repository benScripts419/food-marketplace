
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  scheme: "food-marketplace",
  path: "auth/callback",
});

type SocialProvider = "google" | "apple";

type AuthCallbackParams = {
  access_token?: string;
  refresh_token?: string;
  code?: string;
  error?: string;
  error_description?: string;
};

function getCallbackParams(url: string): AuthCallbackParams {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  // OAuth responses may put values in either the query or hash.
  const hashParams = new URLSearchParams(
    parsedUrl.hash.startsWith("#")
      ? parsedUrl.hash.slice(1)
      : parsedUrl.hash,
  );

  const getValue = (key: string) =>
    params.get(key) ?? hashParams.get(key) ?? undefined;

  return {
    access_token: getValue("access_token"),
    refresh_token: getValue("refresh_token"),
    code: getValue("code"),
    error: getValue("error"),
    error_description: getValue("error_description"),
  };
}

export function useSocialAuth() {
  const [loadingProvider, setLoadingProvider] =
    useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInWithBrowser = async (provider: SocialProvider) => {
    
if (Platform.OS === "web") {
  const webRedirectUri = new URL(
    "/auth/callback",
    window.location.origin
  ).toString();

  const { data, error: oauthError } =
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: webRedirectUri,
      },
    });

  if (oauthError) throw oauthError;

  if (!data.url) {
    throw new Error("Supabase did not return an OAuth URL.");
  }

  console.log("Web OAuth redirect:", webRedirectUri);
  console.log("Opening Google OAuth:", Boolean(data.url));

  // Supabase automatically redirects the browser on web.
  return false;
}



    console.log("Starting Google OAuth...");

    const { data, error: oauthError } =
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

    if (oauthError) throw oauthError;

    if (!data.url) {
      throw new Error("Supabase did not return a Google sign-in URL.");
    }

    console.log("Google OAuth URL created:", Boolean(data.url));
    console.log("Opening Google sign-in browser...");

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
    );

    console.log("Google browser result:", result.type);

    if (result.type === "cancel" || result.type === "dismiss") {
      return false;
    }

    if (result.type !== "success") {
      throw new Error("The authentication browser did not return successfully.");
    }

    const callbackParams = getCallbackParams(result.url);

    console.log("OAuth callback received:", {
      hasCode: Boolean(callbackParams.code),
      hasAccessToken: Boolean(callbackParams.access_token),
      hasRefreshToken: Boolean(callbackParams.refresh_token),
      error: callbackParams.error ?? null,
      errorDescription: callbackParams.error_description ?? null,
    });

    if (callbackParams.error || callbackParams.error_description) {
      throw new Error(
        callbackParams.error_description ??
          callbackParams.error ??
          "Google authentication failed.",
      );
    }

    if (callbackParams.code) {
  console.log("Exchanging OAuth code for session...");

  const { data, error } =
    await supabase.auth.exchangeCodeForSession(callbackParams.code);

  if (error) {
    console.error("OAuth code exchange failed:", error.message);
    throw error;
  }

  if (!data.session) {
    throw new Error("The OAuth exchange did not create a session.");
  }

  console.log("OAuth session created:", true);

  return true;
}
    if (callbackParams.access_token && callbackParams.refresh_token) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: callbackParams.access_token,
          refresh_token: callbackParams.refresh_token,
        });

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        throw new Error("The OAuth callback did not create a session.");
      }

      console.log("OAuth session created:", true);
      return true;
    }

    throw new Error(
      "The callback returned neither an authorization code nor valid session tokens.",
    );
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

    const { error: sessionError } =
      await supabase.auth.signInWithIdToken({
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
      const message =
        authError instanceof Error
          ? authError.message
          : "Unable to sign in right now.";

      console.error(`${provider} sign-in failed:`, message);
      setError(message);

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
