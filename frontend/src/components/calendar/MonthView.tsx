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
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";

interface MonthViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, onDateClick }) => {
  const { getHolidayStatus, holidays, halfHolidays } = useConfig();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

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
        {weekDays.map((day, idx) => {
          const isHeaderHoliday = holidays.includes(idx);
          const isHeaderHalf = !!halfHolidays[idx];
          const halfColor = halfHolidays[idx]?.color;
          return (
            <div
              key={day}
              className={`text-center text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                isHeaderHoliday ? "text-holiday" : "text-muted-foreground"
              }`}
              style={isHeaderHalf ? { color: halfColor } : {}}
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.charAt(0)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1 md:gap-2 lg:gap-4 overflow-y-auto custom-scrollbar">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          
          const status = getHolidayStatus(day);
          const isFullHoliday = status.type === "FULL";
          const isHalfHoliday = status.type === "HALF";

          return (
            <div
              key={day.toString()}
              onClick={() => {
                if (isAdmin && onDateClick) {
                  onDateClick(day);
                }
              }}
              className={`relative rounded-xl md:rounded-2xl p-1 md:p-2 h-full min-h-[60px] md:min-h-[100px] flex flex-col group transition-all ring-1 ring-inset ${
                isCurrentMonth
                  ? isFullHoliday
                    ? "bg-holiday-bg ring-holiday/20 hover:ring-holiday/50"
                    : isHalfHoliday
                      ? `bg-opacity-10 ring-opacity-20 hover:ring-opacity-50` // Base styles, custom color applied via style
                      : "bg-background ring-border hover:ring-primary/50"
                  : "bg-muted/50 ring-transparent text-muted-foreground/50"
              } ${isAdmin ? "cursor-pointer" : ""}`}
              style={isCurrentMonth && isHalfHoliday ? { 
                backgroundColor: `${status.config?.color}11`, // 11 is hex for ~7% opacity
                boxShadow: `inset 0 0 0 1px ${status.config?.color}33` // 33 is hex for 20% opacity
              } : {}}
            >
              <div className="flex justify-center md:justify-between items-center mb-1 md:mb-2">
                <span
                  className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full md:rounded-xl text-xs md:text-sm font-bold transition-all ${
                    isTodayDate
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 md:scale-110"
                      : isCurrentMonth
                      ? isFullHoliday ? "text-holiday" : "text-foreground"
                      : "text-muted-foreground"
                  }`}
                  style={isCurrentMonth && isHalfHoliday && !isTodayDate ? { color: status.config?.color } : {}}
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
