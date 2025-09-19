import { API_BASE_URL } from "../config/api";

export interface SystemSetting {
  value: string;
  description?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export type SystemSettings = Record<string, SystemSetting>;

class SystemSettingsService {
  private baseUrl = `${API_BASE_URL}/settings`;

  async getAllSettings(): Promise<SystemSettings> {
    const response = await fetch(this.baseUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch system settings");
    }

    return response.json();
  }

  async getSetting(key: string): Promise<SystemSetting> {
    const response = await fetch(`${this.baseUrl}/${key}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch setting: ${key}`);
    }

    return response.json();
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string,
    updatedBy?: number
  ): Promise<{ success: boolean; key: string; value: string }> {
    const response = await fetch(`${this.baseUrl}/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value, description, updatedBy }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update setting: ${key}`);
    }

    return response.json();
  }

  async toggleMockMode(): Promise<{ mockMode: boolean }> {
    const response = await fetch(`${this.baseUrl}/mock-mode/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to toggle mock mode");
    }

    return response.json();
  }

  async getMockModeStatus(): Promise<boolean> {
    try {
      const setting = await this.getSetting("mockMode");
      return setting.value === "true";
    } catch (error) {
      // Default to false if setting doesn't exist
      return false;
    }
  }
}

export default new SystemSettingsService();