import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  NotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../services/NotificationPreferencesService";

interface PreferencesContextType {
  preferences: NotificationPreferences | null;
  setPreference: (type: keyof NotificationPreferences, value: boolean) => void;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export const PreferencesProvider: React.FC<{
  userId: number;
  children: ReactNode;
}> = ({ userId, children }) => {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNotificationPreferences(userId)
      .then((prefs) => setPreferences(prefs))
      .finally(() => setLoading(false));
  }, [userId]);

  const setPreference = (
    type: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!preferences) return;
    const updated = { ...preferences, [type]: value };
    setPreferences(updated);
    updateNotificationPreferences(userId, updated).catch(() => {
      // Optionally handle error, revert state, or show toast
    });
  };

  return (
    <PreferencesContext.Provider
      value={{ preferences, setPreference, loading }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
};
