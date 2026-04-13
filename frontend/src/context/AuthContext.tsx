"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

type Role = "PUBLIC" | "STAFF" | "ADMIN";

interface AuthContextType {
  role: Role;
  user: any | null;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("PUBLIC");
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Validate token seamlessly
      setIsLoading(true);
      fetchApi("/user").then((userData) => {
        setUser(userData);
        if (userData && userData.is_admin) {
          setRole("ADMIN");
        } else {
          setRole("STAFF");
        }
      }).catch(() => {
        localStorage.removeItem("auth_token");
        setRole("PUBLIC");
        setUser(null);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setRole("PUBLIC");
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
    setRole(userData.is_admin ? "ADMIN" : "STAFF");
  };

  const logout = () => {
    fetchApi("/logout", { method: "POST" }).catch(() => {});
    setRole("PUBLIC");
    setUser(null);
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ role, user, isLoading, login, logout, setUser }}>
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
