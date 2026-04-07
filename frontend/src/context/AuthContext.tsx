"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

type Role = "GUEST" | "ADMIN";

interface AuthContextType {
  role: Role;
  login: (token: string, asAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("GUEST");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Validate token seamlessly
      fetchApi("/user").then((user) => {
        if (user && user.is_admin) {
          setRole("ADMIN");
        }
      }).catch(() => {
        localStorage.removeItem("auth_token");
        setRole("GUEST");
      });
    }
  }, []);

  const login = (token: string, asAdmin: boolean) => {
    localStorage.setItem("auth_token", token);
    setRole(asAdmin ? "ADMIN" : "GUEST");
  };

  const logout = () => {
    fetchApi("/logout", { method: "POST" }).catch(() => {});
    setRole("GUEST");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
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
