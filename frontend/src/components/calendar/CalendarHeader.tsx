"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Grid3X3, 
  Columns, 
  Square, 
  Plus,
  Settings2,
  Bell,
  X,
  Megaphone,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { fetchApi } from "@/lib/api";
import NepaliDate from "nepali-datetime";
import NotificationDrawer from "./NotificationDrawer";

type ViewType = "month" | "week" | "day";

interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  setView: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  setView,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
}) => {
  const { role, user } = useAuth();
  const isAdmin = role === "ADMIN";
  const { calendarMode, setCalendarMode, settings } = useConfig();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  
  const nd = new NepaliDate(currentDate);
  const headerTitle = calendarMode === "BS" 
    ? nd.format("MMMM YYYY") 
    : format(currentDate, "MMMM yyyy");

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const notes = await fetchApi("/notifications");
        setUnreadCount(notes.filter((n: any) => !n.is_read).length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-2 md:p-3 bg-background/80 backdrop-blur-xl sticky top-14 md:top-16 z-40 border-b border-border m-0">
        {/* Left Section: Nav Controls */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="flex items-center gap-0.5 md:gap-1 bg-muted p-1 rounded-xl border border-border">
            <button onClick={onPrev} className="p-1.5 md:p-2 hover:bg-background rounded-lg md:rounded-xl transition-all text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={onToday} className="hidden sm:block px-3 py-1.5 text-xs font-bold text-foreground hover:bg-background rounded-xl transition-all">
              Today
            </button>
            <button onClick={onNext} className="p-1.5 md:p-2 hover:bg-background rounded-lg md:rounded-xl transition-all text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
          <h1 className="text-sm md:text-xl font-black text-foreground tracking-tight ml-2 m-0">
            {headerTitle}
          </h1>
        </div>

        {/* Right Section: View & Mode Toggles */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* AD/BS Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
            {(["AD", "BS"] as const).map((mode) => (
               <button
                 key={mode}
                 onClick={() => setCalendarMode(mode)}
                 className={`px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${
                   calendarMode === mode
                     ? "bg-background text-primary shadow-sm"
                     : "text-muted-foreground hover:text-foreground"
                 }`}
               >
                 {mode}
               </button>
            ))}
          </div>

          {/* View Toggles */}
          <div className="hidden lg:flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
            {(["month", "week", "day"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${
                  view === v
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {/* {v === "month" && <Grid3X3 className="w-3.5 h-3.5" />}
                {v === "week" && <Columns className="w-3.5 h-3.5" />}
                {v === "day" && <Square className="w-3.5 h-3.5" />} */}
                <span>{v}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {isAdmin && (
              <button 
                onClick={onAddEvent}
                className="hidden md:flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                 <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                 <span>Event</span>
              </button>
            )}

            {user && (
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-muted border border-border text-foreground hover:bg-background transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                      {unreadCount}
                   </span>
                )}
              </button>
            )}

            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-8 h-8 flex sm:hidden items-center justify-center rounded-xl bg-muted border border-border text-foreground"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <NotificationDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Mobile Bottom Navigation (PWA-optimized) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden w-[90%] max-w-sm">
         <div className="bg-background/80 backdrop-blur-2xl border border-border shadow-2xl rounded-3xl p-2 px-3 flex items-center justify-between">
            <button onClick={onToday} className="flex flex-col items-center gap-0.5 p-2 flex-1 group active:scale-90 transition-transform">
               <CalendarIcon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
               <span className="text-[9px] font-black uppercase tracking-tighter">Today</span>
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />

            <div className="flex items-center gap-1 flex-[3]">
              {(["month", "week", "day"] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 p-2 rounded-2xl flex flex-col items-center gap-0.5 transition-all ${view === v ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground'}`}
                >
                  {v === "month" && <Grid3X3 className="w-5 h-5" />}
                  {v === "week" && <Columns className="w-5 h-5" />}
                  {v === "day" && <Square className="w-5 h-5" />}
                  <span className="text-[9px] font-black uppercase tracking-tighter capitalize">{v}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {isAdmin ? (
               <button 
                onClick={onAddEvent}
                className="flex-1 w-11 h-11 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-all"
               >
                  <Plus className="w-6 h-6 stroke-[3px]" />
               </button>
            ) : (
               <Link href="/announcements" className="flex flex-col items-center gap-0.5 p-2 flex-1 group active:scale-90 transition-transform">
                  <Megaphone className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-tighter">News</span>
               </Link>
            )}
         </div>
      </nav>

      {/* Mobile Sidebar Menu (Animated) */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[120] w-72 bg-background border-l border-border shadow-2xl p-6 flex flex-col gap-6 md:hidden"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Calendar Menu</h3>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-muted rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <Link 
                  href="/announcements"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-4 p-4 bg-muted/50 border border-border rounded-2xl text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all font-black"
                >
                   <Megaphone className="w-5 h-5 text-primary" />
                   Announcements
                </Link>

                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Calendar Mode</label>
                   <div className="grid grid-cols-2 gap-2 bg-muted p-1.5 rounded-2xl border border-border">
                      {(["AD", "BS"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setCalendarMode(mode)}
                          className={`py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                            calendarMode === mode
                              ? "bg-background text-primary shadow-sm"
                              : "text-muted-foreground"
                          }`}
                        >
                          {mode === "AD" ? "English (AD)" : "Nepali (BS)"}
                        </button>
                      ))}
                   </div>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-2 mt-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Administration</label>
                    <Link 
                      href="/admin"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 w-full p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-sm"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Admin Panel
                    </Link>
                  </div>
                )}
              </div>

              <p className="mt-auto text-center text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
                Nepali Calendar v1.0
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarHeader;
