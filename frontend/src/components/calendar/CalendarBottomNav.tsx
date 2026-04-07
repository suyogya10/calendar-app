"use client";

import React from "react";
import { Grid3X3, Columns, Square, Plus } from "lucide-react";

type ViewType = "month" | "week" | "day";

interface CalendarBottomNavProps {
  view: ViewType;
  setView: (view: ViewType) => void;
}

const CalendarBottomNav: React.FC<CalendarBottomNavProps> = ({ view, setView }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-zinc-200/60 z-50 px-6 pb-safe flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      {(["month", "week", "day"] as ViewType[]).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`flex flex-col items-center gap-1 w-16 transition-all ${
            view === v ? "text-indigo-600 scale-110" : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          {v === "month" && <Grid3X3 className="w-6 h-6" />}
          {v === "week" && <Columns className="w-6 h-6" />}
          {v === "day" && <Square className="w-6 h-6" />}
          <span className="text-[10px] font-bold uppercase tracking-widest">{v}</span>
        </button>
      ))}
      <button className="absolute left-1/2 -top-6 -translate-x-1/2 w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white active:scale-95 transition-all">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CalendarBottomNav;
