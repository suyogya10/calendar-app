"use client";

import React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, Columns, Square, Plus } from "lucide-react";

import { ThemeToggle } from "../ThemeToggle";

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
  return (
    <div className="flex items-center justify-between gap-2 p-4 md:p-6 bg-background/80 backdrop-blur-xl sticky top-0 z-40 border-b border-border shadow-sm md:shadow-none">
      <div className="flex items-center gap-3">
        <div className="p-2 md:p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl md:rounded-2xl shadow-lg shadow-primary/30 text-primary-foreground">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tighter leading-none">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <p className="text-[9px] md:text-[10px] font-black text-primary/70 uppercase tracking-[0.2em] mt-0.5">
            {view} view
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1 bg-muted p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-border">
          <button
            onClick={onPrev}
            className="p-1.5 md:p-2 hover:bg-background rounded-lg md:rounded-xl transition-all active:scale-90 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold text-foreground hover:bg-background rounded-lg md:rounded-xl transition-all shadow-sm shadow-black/5 active:scale-95 border border-transparent hover:border-border-theme"
          >
            Today
          </button>
          <button
            onClick={onNext}
            className="p-1.5 md:p-2 hover:bg-background rounded-lg md:rounded-xl transition-all active:scale-90 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Desktop View Switcher */}
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
        
        {/* Theme Toggle Button */}
        <div className="ml-1 md:ml-2">
          <ThemeToggle />
        </div>
        
        {/* Responsive Add Event Button 
            TODO (Phase 2): Re-enable this button once User Authentication is implemented.
            The public default view should be read-only for now.
        <button 
          onClick={onAddEvent}
          className="flex items-center justify-center gap-2 ml-1 md:ml-2 p-2 md:px-6 md:py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
        >
           <Plus className="w-5 h-5 md:w-4 md:h-4"/>
           <span className="hidden md:inline">New Event</span>
        </button>
        */}
      </div>
    </div>
  );
};

export default CalendarHeader;
