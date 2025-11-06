"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  role?: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyToken: (token: string) => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Check for stored user session
    const storedToken = localStorage.getItem("habilitadev_token");
    if (storedToken) {
      try {
        // Verify token with backend
        verifyToken(storedToken);
      } catch (error) {
        console.error("Error verifying token:", error);
        localStorage.removeItem("habilitadev_token");
        localStorage.removeItem("habilitadev_refresh_token");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user || userData.data?.user);
        return;
      } else {
        // Token inválido
        localStorage.removeItem("habilitadev_token");
        localStorage.removeItem("habilitadev_refresh_token");
        throw new Error("Token inválido ou expirado");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("habilitadev_token");
      localStorage.removeItem("habilitadev_refresh_token");
      throw error;
    } finally {
      // Só alterar loading se não estiver sendo chamado de fora do useEffect inicial
      if (loading) {
        setLoading(false);
      }
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data?.user || data.user);
        localStorage.setItem("habilitadev_token", data.data?.token || data.token);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        // Extrair mensagem do objeto de erro ou usar fallback
        let errorMessage = "Erro no login";
        
        if (data.error) {
          if (typeof data.error === 'object') {
            // Se error é um objeto, extrair a propriedade message
            errorMessage = data.error.message || data.error.code || "Erro no login";
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        } else if (data.message) {
          errorMessage = typeof data.message === 'string' ? data.message : "Erro no login";
        }
        
        return { success: false, error: String(errorMessage) };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: "Erro de conexão" };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data?.user || data.user);
        localStorage.setItem("habilitadev_token", data.data?.token || data.token);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        // Extrair mensagem do objeto de erro ou usar fallback
        let errorMessage = "Erro no registro";
        
        if (data.error) {
          if (typeof data.error === 'object') {
            // Se error é um objeto, extrair a propriedade message
            errorMessage = data.error.message || data.error.code || "Erro no registro";
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          }
        } else if (data.message) {
          errorMessage = typeof data.message === 'string' ? data.message : "Erro no registro";
        }
        
        return { success: false, error: String(errorMessage) };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: "Erro de conexão" };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("habilitadev_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("habilitadev_token");
      localStorage.removeItem("habilitadev_refresh_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        verifyToken,
        loading,
        isAdmin,
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
