"use client";

import React from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek
} from "date-fns";

interface MonthViewProps {
  currentDate: Date;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full p-2 md:p-6 lg:p-8 animate-in fade-in duration-500 overflow-hidden">
      <div className="grid grid-cols-7 mb-2 md:mb-4 border-b border-zinc-200 pb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400"
          >
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1 md:gap-2 lg:gap-4 overflow-y-auto custom-scrollbar">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`relative rounded-xl md:rounded-2xl p-1 md:p-2 h-full min-h-[60px] md:min-h-[100px] flex flex-col group transition-all ring-1 ring-inset ${
                isCurrentMonth
                  ? "bg-white ring-zinc-200 hover:ring-indigo-500/50 cursor-pointer"
                  : "bg-zinc-50/50 ring-zinc-100 text-zinc-400/50"
              }`}
            >
              <div className="flex justify-center md:justify-between items-center mb-1 md:mb-2">
                <span
                  className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full md:rounded-xl text-xs md:text-sm font-bold transition-all ${
                    isTodayDate
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 md:scale-110"
                      : isCurrentMonth
                      ? "text-zinc-800"
                      : "text-zinc-400"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 items-center md:items-stretch overflow-hidden">
                {/* Placeholder for events */}
                {isTodayDate && (
                   <>
                     {/* Mobile dot indicator */}
                     <div className="md:hidden w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5"></div>
                     
                     {/* Desktop text indicator */}
                     <div className="hidden md:block px-2 py-1 bg-indigo-50 text-[10px] font-bold text-indigo-700 rounded-lg border border-indigo-100 truncate w-full">
                        Team Sync
                     </div>
                   </>
                )}
              </div>
              
              <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 rounded-xl md:rounded-2xl transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
