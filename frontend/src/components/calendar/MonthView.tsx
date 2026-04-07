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
  startOfWeek,
  isSaturday
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
    <div className="flex flex-col h-full p-2 md:p-6 lg:p-8 animate-in fade-in duration-500 overflow-hidden bg-background">
      <div className="grid grid-cols-7 mb-2 md:mb-4 border-b border-border pb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className={`text-center text-[10px] md:text-xs font-bold uppercase tracking-widest ${
              day === "Sat" ? "text-holiday" : "text-muted-foreground"
            }`}
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
          const isHoliday = isSaturday(day);

          return (
            <div
              key={day.toString()}
              className={`relative rounded-xl md:rounded-2xl p-1 md:p-2 h-full min-h-[60px] md:min-h-[100px] flex flex-col group transition-all ring-1 ring-inset ${
                isCurrentMonth
                  ? isHoliday
                    ? "bg-holiday-bg ring-holiday/20 hover:ring-holiday/50 cursor-pointer"
                    : "bg-background ring-border hover:ring-primary/50 cursor-pointer"
                  : "bg-muted/50 ring-transparent text-muted-foreground/50"
              }`}
            >
              <div className="flex justify-center md:justify-between items-center mb-1 md:mb-2">
                <span
                  className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full md:rounded-xl text-xs md:text-sm font-bold transition-all ${
                    isTodayDate
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 md:scale-110"
                      : isCurrentMonth
                      ? isHoliday ? "text-holiday" : "text-foreground"
                      : "text-muted-foreground"
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
                    <div className="md:hidden w-1.5 h-1.5 rounded-full bg-secondary mt-0.5" title="Secondary Brand Color Action"></div>
                    
                    {/* Desktop text indicator */}
                    <div className="hidden md:block px-2 py-1 bg-primary/10 text-[10px] font-bold text-primary rounded-lg border border-primary/20 truncate w-full">
                       Team Sync
                    </div>
                  </>
                )}
              </div>
              
              <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 rounded-xl md:rounded-2xl transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
