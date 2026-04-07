"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "GUEST" | "ADMIN";

interface AuthContextType {
  role: Role;
  login: (asAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("GUEST");

  useEffect(() => {
    // Attempt to read from localStorage just for persistence during dev
    const savedRole = localStorage.getItem("mock_role") as Role;
    if (savedRole && (savedRole === "ADMIN" || savedRole === "GUEST")) {
      setRole(savedRole);
    }
  }, []);

  const login = (asAdmin: boolean) => {
    const newRole = asAdmin ? "ADMIN" : "GUEST";
    setRole(newRole);
    localStorage.setItem("mock_role", newRole);
  };

  const logout = () => {
    setRole("GUEST");
    localStorage.removeItem("mock_role");
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
