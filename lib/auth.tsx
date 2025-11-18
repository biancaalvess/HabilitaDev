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
  is_verified?: boolean;
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

// Chave para armazenar cache do perfil no localStorage
const USER_CACHE_KEY = "habilitadev_user_cache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos

interface CachedUserData {
  user: User;
  timestamp: number;
}

// Função para salvar perfil no cache local
function saveUserToCache(user: User): void {
  if (typeof window === "undefined") return;
  
  try {
    const cacheData: CachedUserData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        role: user.role,
        is_verified: user.is_verified,
      },
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Erro ao salvar cache do usuário:", error);
  }
}

// Função para recuperar perfil do cache local
function getUserFromCache(): User | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (!cached) return null;
    
    const cacheData: CachedUserData = JSON.parse(cached);
    
    // Verificar se o cache expirou
    if (Date.now() - cacheData.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    }
    
    return cacheData.user;
  } catch (error) {
    console.warn("Erro ao recuperar cache do usuário:", error);
    localStorage.removeItem(USER_CACHE_KEY);
    return null;
  }
}

// Função para limpar cache do usuário
function clearUserCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_CACHE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Tentar recuperar do cache primeiro para UX mais rápida
    const cachedUser = getUserFromCache();
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    }

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
          const user = userData.data?.user || userData.user;
          setUser(user);
          // Salvar no cache após verificação bem-sucedida
          if (user) {
            saveUserToCache(user);
          }
        } else {
          // 401 é esperado quando não há sessão válida - não é um erro
          if (response.status !== 401) {
            console.warn("Erro ao verificar sessão:", response.status, response.statusText);
          }
          // Não há sessão válida - limpar cache
          setUser(null);
          clearUserCache();
        }
      } catch (error) {
        // Apenas logar erros que não sejam relacionados a falta de autenticação
        if (error instanceof Error && !error.message.includes('401')) {
          console.error("Error verifying session:", error);
        }
        setUser(null);
        clearUserCache();
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
        const user = data.data?.user || data.user;
        setUser(user);
        // Salvar no cache após login bem-sucedido
        if (user) {
          saveUserToCache(user);
        }
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
        const user = data.data?.user || data.user;
        setUser(user);
        // Salvar no cache após registro bem-sucedido
        if (user) {
          saveUserToCache(user);
        }
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
      // Limpar estado do usuário e cache
      setUser(null);
      clearUserCache();
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
