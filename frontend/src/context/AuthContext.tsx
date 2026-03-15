import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Role, User } from "@/types/api";
import { showSuccess } from "@/utils/toast";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN = "restaurant_token";
const STORAGE_USER = "restaurant_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(STORAGE_TOKEN),
  );
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .me(token)
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser));
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = (email: string, password: string) =>
    api.login(email, password).then((response) => {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem(STORAGE_TOKEN, response.token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(response.user));
      showSuccess(`Welcome back, ${response.user.name}`);
    });

  const logout = () => {
    const currentToken = token;
    const clearState = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      showSuccess("Logged out");
    };

    if (!currentToken) {
      clearState();
      return Promise.resolve();
    }

    return api.logout(currentToken).finally(clearState);
  };

  const hasRole = (roles: Role[]) => !!user && roles.includes(user.role);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      hasRole,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
};