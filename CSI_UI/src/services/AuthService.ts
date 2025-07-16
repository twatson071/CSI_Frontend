import { authClient } from "../lib/auth-client";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}

export const AuthService = {
  async signIn(data: SignInPayload): Promise<AuthResponse> {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, user: result.data?.user };
    } catch (error: any) {
      return { success: false, error: error.message || "Sign in failed" };
    }
  },

  async signUp(data: SignUpPayload): Promise<AuthResponse> {
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, user: result.data?.user };
    } catch (error: any) {
      return { success: false, error: error.message || "Sign up failed" };
    }
  },

  async signOut(): Promise<void> {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },

  async getSession() {
    try {
      return await authClient.getSession();
    } catch (error) {
      console.error("Get session error:", error);
      return null;
    }
  },

  async refreshSession() {
    try {
      return await authClient.getSession();
    } catch (error) {
      console.error("Refresh session error:", error);
      throw error;
    }
  },
};

// Legacy exports for backward compatibility
export async function signIn(data: SignInPayload): Promise<void> {
  const result = await AuthService.signIn(data);
  if (!result.success) {
    throw new Error(result.error);
  }
}
