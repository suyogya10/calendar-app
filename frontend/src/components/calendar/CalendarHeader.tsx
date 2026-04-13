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
  const pathname = usePathname();
  
  const nd = new NepaliDate(currentDate);
  const headerTitle = calendarMode === "BS" 
    ? nd.format("MMMM YYYY") 
    : format(currentDate, "MMMM yyyy");



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
          {/* AD/BS Toggle - Always visible now */}
          <div className="flex items-center gap-0.5 md:gap-1 bg-muted p-0.5 md:p-1 rounded-lg md:rounded-xl border border-border">
            {(["AD", "BS"] as const).map((mode) => (
               <button
                 key={mode}
                 onClick={() => setCalendarMode(mode)}
                 className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
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
                <span>{v}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {user && (
              <button 
                onClick={onAddEvent}
                className="hidden md:flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                 <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                 <span>Event</span>
              </button>
            )}
          </div>
        </div>
      </div>



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

            {user ? (
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

    </>
  );
};

export default CalendarHeader;
