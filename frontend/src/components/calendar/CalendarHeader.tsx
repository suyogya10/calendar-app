"use client";

import React, { useState } from "react";
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
  MoreVertical,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "../ThemeToggle";
import { LoginButton } from "../LoginButton";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
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
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const { calendarMode, setCalendarMode, settings } = useConfig();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const nd = new NepaliDate(currentDate);
  const headerTitle = calendarMode === "BS" 
    ? nd.format("MMMM YYYY") 
    : format(currentDate, "MMMM yyyy");

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-3 md:p-6 bg-background/80 backdrop-blur-xl sticky top-0 z-40 border-b border-border shadow-sm md:shadow-none">
        {/* Left Section: Logo & Date */}
        <div className="flex items-center gap-2 md:gap-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-9 h-9 md:w-12 md:h-12 rounded-xl object-contain" />
          ) : (
            <div className="p-2 md:p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl md:rounded-2xl shadow-lg shadow-primary/30 text-primary-foreground">
              <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black text-foreground tracking-tighter leading-none whitespace-nowrap">
              {headerTitle}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 md:hidden">
               <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest">{view}</span>
               <div className="w-1 h-1 rounded-full bg-border" />
               <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest">{calendarMode} Mode</span>
            </div>
          </div>
        </div>

        {/* Right Section: Controls */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* AD/BS Toggle - Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-muted p-1.5 rounded-2xl border border-border">
            {(["AD", "BS"] as const).map((mode) => (
               <button
                 key={mode}
                 onClick={() => setCalendarMode(mode)}
                 className={`px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                   calendarMode === mode
                     ? "bg-background text-primary shadow-sm shadow-black/5 ring-1 ring-border"
                     : "text-muted-foreground hover:text-foreground"
                 }`}
               >
                 {mode}
               </button>
            ))}
          </div>

          {/* Nav Controls - More Compact on Mobile */}
          <div className="flex items-center gap-0.5 md:gap-1 bg-muted p-1 rounded-xl md:rounded-2xl border border-border">
            <button onClick={onPrev} className="p-1.5 md:p-2 hover:bg-background rounded-lg md:rounded-xl transition-all text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={onToday} className="hidden md:block px-4 py-2 text-xs font-bold text-foreground hover:bg-background rounded-xl transition-all">
              Today
            </button>
            <button onClick={onNext} className="p-1.5 md:p-2 hover:bg-background rounded-lg md:rounded-xl transition-all text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-muted p-1.5 rounded-2xl border border-border">
            {(["month", "week", "day"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                  view === v
                    ? "bg-background text-primary shadow-xl shadow-black/5 ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "month" && <Grid3X3 className="w-3.5 h-3.5" />}
                {v === "week" && <Columns className="w-3.5 h-3.5" />}
                {v === "day" && <Square className="w-3.5 h-3.5" />}
                <span>{v}</span>
              </button>
            ))}
          </div>

          {isAdmin && (
            <button 
              onClick={onAddEvent}
              className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-black text-sm rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all ml-2"
            >
               <Plus className="w-4 h-4 stroke-[3px]" />
               <span>Create</span>
            </button>
          )}

          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <div className="md:hidden">
               <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted border border-border text-foreground md:hidden"
               >
                 <Settings2 className="w-4 h-4" />
               </button>
            </div>
            <LoginButton />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (PWA-optimized) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden">
         <div className="bg-background/80 backdrop-blur-2xl border border-border shadow-2xl rounded-3xl p-2 px-4 flex items-center gap-4">
            <button onClick={onToday} className="flex flex-col items-center gap-0.5 p-2 px-3 hover:bg-muted rounded-2xl transition-all active:scale-90">
               <CalendarIcon className="w-5 h-5 text-foreground" />
               <span className="text-[10px] font-black uppercase tracking-tighter">Today</span>
            </button>
            
            <div className="w-px h-8 bg-border" />

            <div className="flex items-center gap-1">
              {(["month", "week", "day"] as ViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`p-2 px-3 rounded-2xl flex flex-col items-center gap-0.5 transition-all ${view === v ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground'}`}
                >
                  {v === "month" && <Grid3X3 className="w-5 h-5" />}
                  {v === "week" && <Columns className="w-5 h-5" />}
                  {v === "day" && <Square className="w-5 h-5" />}
                  <span className="text-[10px] font-black uppercase tracking-tighter capitalize">{v}</span>
                </button>
              ))}
            </div>

            {isAdmin && (
              <>
                <div className="w-px h-8 bg-border" />
                <button 
                  onClick={onAddEvent}
                  className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-all"
                >
                   <Plus className="w-6 h-6 stroke-[3px]" />
                </button>
              </>
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
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Calendar Settings</h3>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-muted rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
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

// Simple X icon since we are missing it in imports
const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default CalendarHeader;
