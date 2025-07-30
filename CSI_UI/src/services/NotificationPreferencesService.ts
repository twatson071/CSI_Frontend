// NotificationPreferencesService.ts

import { apiRequest } from "../utils/apiRequest";

export type NotificationPreferences = {
  alerts: boolean;
  critical: boolean;
  device: boolean;
  info: boolean;
  system: boolean;
};

export const getNotificationPreferences = async (
  userId: number
): Promise<NotificationPreferences | null> => {
  try {
    let prefs = await apiRequest<NotificationPreferences | string>(
      "GET",
      `/users/${userId}/preferences`
    );
    if (typeof prefs === "string") {
      try {
        prefs = JSON.parse(prefs);
      } catch {
        return null;
      }
    }
    return prefs as NotificationPreferences;
  } catch (error) {
    console.error("Failed to fetch notification preferences:", error);
    return null;
  }
};

export const updateNotificationPreferences = async (
  userId: number,
  prefs: NotificationPreferences
): Promise<NotificationPreferences | null> => {
  try {
    return await apiRequest<NotificationPreferences>(
      "PUT",
      `/users/${userId}/preferences`,
      prefs
    );
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return null;
  }
};
