import { router, type Href } from "expo-router";

// Go back if there is a previous screen, otherwise go to a fallback screen.
//
// On the web, reloading the page or opening a link directly leaves the app
// with no previous screen. router.back() then does nothing (and logs
// "The action 'GO_BACK' was not handled by any navigator"), so the
// person is left stuck on the screen.
export function goBackOr(fallback: Href = "/(tabs)") {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}