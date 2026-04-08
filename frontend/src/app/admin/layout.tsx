"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  Menu,
  ChevronLeft,
  LogOut,
  Palmtree,
  Megaphone
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      const token = localStorage.getItem("auth_token");
      if (!token || role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [mounted, isLoading, role, router]);

  if (!mounted || isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-muted-foreground animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (role !== "ADMIN") return null;

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Events", href: "/admin/events", icon: CalendarIcon },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-muted/30 border-r border-border transition-all duration-300 ease-in-out backdrop-blur-xl md:backdrop-blur-none
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "w-64 md:w-64"}
        `}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-border shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "md:opacity-0 w-0" : "opacity-100"}`}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-black text-foreground tracking-tight text-lg min-w-max">Admin Panel</span>
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-auto shrink-0 absolute -right-4 top-7 z-10 shadow-sm"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>

          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all whitespace-nowrap group relative overflow-hidden
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-semibold"
                  }
                  ${isCollapsed ? "md:justify-center md:px-0" : ""}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                <span className={`transition-opacity duration-200 ${isCollapsed ? "md:opacity-0 md:w-0" : "opacity-100"}`}>
                  {item.label}
                </span>
                
                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-14 bg-foreground text-background text-xs font-bold px-2 py-1 rounded opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border shrink-0">
          <button 
            onClick={() => {
              logout();
              router.push("/");
            }}
            className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl transition-all text-holiday hover:bg-holiday/10 font-bold whitespace-nowrap group
              ${isCollapsed ? "md:justify-center md:px-0" : ""}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className={`transition-opacity duration-200 ${isCollapsed ? "md:opacity-0 md:w-0" : "opacity-100"}`}>
              Log out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
            <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-muted border border-border text-foreground active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg md:text-xl font-black text-foreground capitalize">
              {pathname === "/admin" ? "Dashboard" : pathname.split("/").pop()}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-3 py-1.5 rounded-xl border border-border"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="w-px h-6 bg-border hidden md:block" />
            <ThemeToggle />
            
            {/* Mobile/Header Logout */}
            <button 
              onClick={() => { logout(); router.push("/"); }}
              className="p-2 md:p-2.5 rounded-xl bg-holiday/10 text-holiday border border-holiday/20 md:hidden"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pl-2 md:pl-0">
               <div className="flex flex-col items-end hidden md:flex">
                 <span className="text-xs font-black text-foreground leading-none">{user?.name}</span>
                 <span className="text-[10px] font-bold text-muted-foreground tracking-tighter">{user?.employee_id}</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase text-sm border border-primary/30 shadow-inner">
                  {getInitials(user?.name)}
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
