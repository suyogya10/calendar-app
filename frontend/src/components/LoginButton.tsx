"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const { role, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (role === "ADMIN") {
    return (
      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => router.push("/admin")}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
        >
          <ShieldCheck className="w-4 h-4" />
          Admin Panel
        </button>
        <button
          onClick={logout}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-muted border border-border text-muted-foreground hover:bg-holiday-bg hover:text-holiday hover:border-holiday/30 transition-all active:scale-95"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-2xl bg-muted border border-border text-foreground hover:bg-background transition-all active:scale-95 shadow-sm"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 mt-2 w-64 bg-background border border-border shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-black text-foreground mb-3 uppercase tracking-wider">Simulated Login</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Since there is no backend yet, please choose a mock role to test the application.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  login(true);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <ShieldCheck className="w-4 h-4" />
                Login as Admin
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-opacity border border-border"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
