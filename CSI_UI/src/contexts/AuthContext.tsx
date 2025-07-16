import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";

export interface User {
  id: number;
  email: string;
  name?: string;
  roleId?: number;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  // Local login
  setLocalUser?: (user: User | null) => void;
  isLocalLogin?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Local login support
  const isLocalLogin = import.meta.env.VITE_LOCAL_LOGIN === "true";
  const [localUser, setLocalUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending]);

  const handleSignIn = async (email: string, password: string) => {
    if (isLocalLogin) {
      setIsLoading(false);
      return { success: false, error: "Local login mode: use local login UI." };
    }
    try {
      setIsLoading(true);
      const result = await authClient.signIn.email({
        email,
        password,
      });
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Sign in failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name?: string
  ) => {
    if (isLocalLogin) {
      setIsLoading(false);
      return { success: false, error: "Local login mode: use local login UI." };
    }
    try {
      setIsLoading(true);
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Sign up failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (isLocalLogin) {
      setLocalUser(null);
      return;
    }
    try {
      setIsLoading(true);
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    if (isLocalLogin) return;
    try {
      setIsLoading(true);
      await authClient.getSession();
    } catch (error) {
      console.error("Session refresh error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use local user if in local login mode
  const value: AuthContextType = {
    user: isLocalLogin ? localUser : session?.user || null,
    isAuthenticated: isLocalLogin ? !!localUser : !!session?.user,
    isLoading: isLoading || isPending,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshSession,
    setLocalUser: isLocalLogin ? setLocalUser : undefined,
    isLocalLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
