"use client";

import React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, Columns, Square, Plus } from "lucide-react";

type ViewType = "month" | "week" | "day";

interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  setView: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  setView,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 p-4 md:p-6 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-zinc-200/60 shadow-sm md:shadow-none">
      <div className="flex items-center gap-3">
        <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-500/30">
          <CalendarIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tighter leading-none">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <p className="text-[9px] md:text-[10px] font-black text-indigo-500/70 uppercase tracking-[0.2em] mt-0.5">
            {view} view
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1 bg-zinc-100/80 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-zinc-200/50">
          <button
            onClick={onPrev}
            className="p-1.5 md:p-2 hover:bg-white rounded-lg md:rounded-xl transition-all active:scale-90 text-zinc-500 hover:text-zinc-900"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold text-zinc-700 hover:bg-white rounded-lg md:rounded-xl transition-all shadow-sm shadow-black/5 active:scale-95"
          >
            Today
          </button>
          <button
            onClick={onNext}
            className="p-1.5 md:p-2 hover:bg-white rounded-lg md:rounded-xl transition-all active:scale-90 text-zinc-500 hover:text-zinc-900"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Desktop View Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/50">
          {(["month", "week", "day"] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                view === v
                  ? "bg-white text-indigo-600 shadow-xl shadow-black/5 ring-1 ring-black/5"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {v === "month" && <Grid3X3 className="w-3.5 h-3.5" />}
              {v === "week" && <Columns className="w-3.5 h-3.5" />}
              {v === "day" && <Square className="w-3.5 h-3.5" />}
              <span>{v}</span>
            </button>
          ))}
        </div>
        
        {/* Mobile quick add button - optional since we have center bottom nav + */}
        <button className="md:hidden ml-1 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
           <Plus className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
