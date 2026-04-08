"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { LogOut, LayoutGrid, User, ShieldCheck, ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function GlobalHeader() {
  const { role, user, logout } = useAuth();
  const { settings } = useConfig();
  const router = useRouter();
  const pathname = usePathname();

  // Don't show header on login or admin pages (admin has its own)
  if (pathname === "/login" || pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-xl border-b border-border shadow-sm h-14 md:h-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          {pathname !== "/" ? (
            <button 
              onClick={() => router.push("/")}
              className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground mr-1"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
              <LayoutGrid className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          )}
          
          <Link href="/" className="flex flex-col m-0 p-0">
            <span className="text-sm md:text-base font-black tracking-tighter leading-tight truncate max-w-[150px] md:max-w-none m-0">
              {settings.siteName || "Dashboard"}
            </span>
            {pathname !== "/" && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {pathname.split('/')[1] || "Home"}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <div className="w-px h-6 bg-border mx-1 hidden md:block" />
          {role === "PUBLIC" ? (
            <button 
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs md:text-sm font-black transition-all"
            >
              <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black leading-none mb-0.5">{user?.name}</span>
                {role === "ADMIN" && <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Administrator</span>}
              </div>
              
              {role === "ADMIN" && pathname !== "/admin" && (
                <button 
                  onClick={() => router.push("/admin")}
                  className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

              <button 
                onClick={logout}
                className="p-2 rounded-xl bg-muted hover:bg-red-500/10 hover:text-red-500 transition-all border border-border"
                title="Log Out"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
