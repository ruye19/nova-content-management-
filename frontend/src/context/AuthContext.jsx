import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpRequest } from "../services/http";

const AuthContext = createContext();

const TOKEN_KEY = "nova_cms_token";
const USER_KEY = "nova_cms_user";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const persist = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persist(null, null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = useCallback(
    async (credentials) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const data = await httpRequest("/auth/login", {
          method: "POST",
          data: credentials,
        });
        setToken(data.token);
        setUser(data.user);
        persist(data.token, data.user);
        navigate("/", { replace: true });
      } catch (error) {
        setAuthError(error.message);
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [navigate]
  );

  const register = useCallback(
    async (payload) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        await httpRequest("/auth/register", {
          method: "POST",
          data: {
            username: payload.name,
            email: payload.email,
            password: payload.password,
          },
        });
        navigate("/login", { replace: true });
      } catch (error) {
        setAuthError(error.message);
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [navigate]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      authError,
      authLoading,
    }),
    [user, token, login, register, logout, authError, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
