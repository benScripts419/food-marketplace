import { Alert as NativeAlert, Platform } from "react-native";

// Alert.alert does nothing in a web browser, so messages and questions never
// appear there. This works like Alert on a phone, and uses the browser's own
// alert and confirm boxes on the web.
//
// Use it by changing a screen's import:
//   import { Alert } from "@/lib/dialog";   // instead of from "react-native"
//
// On the web, a question with two choices (a cancel button and one action)
// becomes a confirm box: OK runs the action, Cancel runs the cancel button.
// A question with more than one action button can't be shown that way, so
// give those screens their own on-page buttons.

type DialogButton = {
  text?: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type BrowserDialogs = {
  alert: (message: string) => void;
  confirm: (message: string) => boolean;
};

export const Alert = {
  alert(title: string, message?: string, buttons?: DialogButton[]) {
    if (Platform.OS !== "web") {
      NativeAlert.alert(title, message, buttons);
      return;
    }

    const browser = globalThis as unknown as BrowserDialogs;
    const text = message ? `${title}\n\n${message}` : title;
    const list = buttons ?? [];
    const cancel = list.find((button) => button.style === "cancel");
    const actions = list.filter((button) => button.style !== "cancel");

    // Just a message.
    if (actions.length === 0) {
      browser.alert(text);
      cancel?.onPress?.();
      return;
    }

    // A message with a single button.
    if (actions.length === 1 && !cancel) {
      browser.alert(text);
      actions[0].onPress?.();
      return;
    }

    // A question: OK runs the first action, Cancel runs the cancel button.
    const confirmed = browser.confirm(text);

    if (confirmed) {
      actions[0].onPress?.();
    } else {
      cancel?.onPress?.();
    }
  },
};