"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

// Interface simplificada - sem autenticação
interface AuthContextType {
  user: null;
  loading: false;
  isAdmin: false;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        loading: false,
        isAdmin: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
