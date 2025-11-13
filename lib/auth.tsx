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
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Verificar se há sessão de usuário via cookie
    // O cookie é enviado automaticamente pelo navegador
    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Importante: incluir cookies na requisição
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.data?.user || userData.user);
        } else {
          // Não há sessão válida
          setUser(null);
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

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
        credentials: "include", // Importante: incluir cookies na requisição
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Cookie é definido automaticamente pelo servidor
        setUser(data.data?.user || data.user);
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
        credentials: "include", // Importante: incluir cookies na requisição
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Cookie é definido automaticamente pelo servidor
        setUser(data.data?.user || data.user);
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
      // Chamar endpoint de logout para limpar cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante: incluir cookies na requisição
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Limpar estado do usuário
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
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
