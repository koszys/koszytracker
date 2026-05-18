"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  avatar?: string;
  identities?: { provider: string }[];
}

interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  identities?: { provider: string }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({ 
            id: decoded.sub, 
            email: decoded.email, 
            name: decoded.name, 
            picture: decoded.picture,
            avatar: decoded.picture,
            identities: decoded.identities
        });
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<JwtPayload>(token);
    setUser({ 
        id: decoded.sub, 
        email: decoded.email, 
        name: decoded.name, 
        picture: decoded.picture,
        avatar: decoded.picture,
        identities: decoded.identities
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}