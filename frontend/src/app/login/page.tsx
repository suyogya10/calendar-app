"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useConfig } from "@/context/ConfigContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { role, login } = useAuth();
  const { settings } = useConfig();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error, toast, dismiss } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (role === "ADMIN" || role === "STAFF") {
      router.push("/");
    }
  }, [role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingId = toast("Verifying credentials...", "loading");

    try {
      const res = await fetchApi("/login", {
        method: "POST",
        body: JSON.stringify({ employee_id: employeeId.trim(), password })
      });
      dismiss(loadingId);
      login(res.access_token, res.data);
      success(`Welcome back, ${res.data.name}!`);
      
      if (res.data.is_admin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      dismiss(loadingId);
      error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">Back to Dashboard</span>
        </Link>

        <div className="bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight text-center">
              Staff Portal
            </h1>
            <p className="text-muted-foreground text-sm font-medium text-center mt-2">
              Sign in to {settings.siteName}
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="EMP-001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-3.5 bg-muted/50 border border-border rounded-2xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-muted/50 border border-border rounded-2xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-3 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              Authorized personnel only. Your IP is logged for security.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
