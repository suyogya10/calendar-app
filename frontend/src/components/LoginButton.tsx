"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export function LoginButton() {
  const { role, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error, toast, dismiss } = useToast();

  // If logged in (Either Admin or Staff)
  if (role === "ADMIN" || role === "STAFF") {
    return (
      <div className="flex items-center gap-2 relative">
        {role === "ADMIN" && (
          <button
            onClick={() => router.push("/admin")}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Panel
          </button>
        )}
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingId = toast("Verifying credentials...", "loading");

    try {
      const res = await fetchApi("/login", {
        method: "POST",
        body: JSON.stringify({ employee_id: employeeId.trim(), password })
      });
      // Correctly set the role and user based on backend response
      dismiss(loadingId);
      login(res.access_token, res.data);
      setIsOpen(false);
      success(`Welcome back, ${res.data.name}!`);
      
      // Auto-redirect to admin if they are admin
      if (res.data.is_admin) {
        router.push("/admin");
      }
    } catch (err: any) {
      dismiss(loadingId);
      error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-2xl bg-muted border border-border text-foreground hover:bg-background transition-all active:scale-95 shadow-sm"
      >
        <UserIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 mt-2 w-72 bg-background border border-border shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-black text-foreground mb-3 uppercase tracking-wider">Staff Login</h3>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                required
              />
              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {loading ? "Verifying..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-opacity border border-border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
