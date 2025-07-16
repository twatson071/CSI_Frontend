import { usePreferences } from "../contexts/PreferencesContext";

export type ToastType = "alerts" | "critical" | "device" | "info" | "system";

export const getJulianDay = (date: Date) => {
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000
  );
};

export const addToast = (
  message: string,
  hideClose: boolean,
  closeAfter: number,
  type: ToastType = "info"
) => {
  // Try to get preferences from context (if in React tree)
  try {
    // This will throw if not in a React context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { preferences } = usePreferences();
    if (preferences && preferences[type] === false) return;
  } catch {
    // Not in a React context, show all toasts
  }

  const toastStack = document.querySelector(
    "rux-toast-stack"
  ) as HTMLRuxToastStackElement;

  toastStack.addToast({
    message: message,
    hideClose: hideClose,
    closeAfter: closeAfter,
  });
};
