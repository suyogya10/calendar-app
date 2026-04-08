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
  subDays
} from "date-fns";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import NepaliDate from "nepali-datetime";

interface MonthViewProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, onDateClick }) => {
  const { getHolidayStatus, settings, apiEvents, apiHolidays, calendarMode } = useConfig();
  const { role } = useAuth();
  
  const isBsMode = calendarMode === "BS";

  let monthStart: Date;
  let monthEnd: Date;
  let currentBsYear: number | null = null;
  let currentBsMonth: number | null = null;

  if (isBsMode) {
    const nd = new NepaliDate(currentDate);
    currentBsYear = nd.getYear();
    currentBsMonth = nd.getMonth();

    const bsMonthStartNd = new NepaliDate(currentBsYear, currentBsMonth, 1);
    monthStart = bsMonthStartNd.getDateObject();

    const nextBsMonth = currentBsMonth === 11 ? 0 : currentBsMonth + 1;
    const nextBsYear = currentBsMonth === 11 ? currentBsYear + 1 : currentBsYear;
    const nextMonthStartNd = new NepaliDate(nextBsYear, nextBsMonth, 1);
    monthEnd = subDays(nextMonthStartNd.getDateObject(), 1);
  } else {
    monthStart = startOfMonth(currentDate);
    monthEnd = endOfMonth(monthStart);
  }

  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full p-2 md:p-6 lg:p-8 animate-in fade-in duration-500 overflow-hidden bg-background">
      <div className="grid grid-cols-7 mb-2 md:mb-4 border-b border-border pb-2 shrink-0">
        {weekDays.map((day, idx) => {
          const isHeaderHoliday = settings.holidayDays.includes(idx);
          const isHeaderHalf = false; // Systemic half holidays discarded in favor of explicit DB holidays
          return (
            <div
              key={day}
              className={`text-center text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                isHeaderHoliday ? "text-holiday" : "text-muted-foreground"
              }`}
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.charAt(0)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1 md:gap-2 lg:gap-4 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
        {days.map((day) => {
          let isCurrentMonth = false;
          let primaryDateText = "";
          let secondaryDateText = "";

          if (isBsMode) {
            const dayNd = new NepaliDate(day);
            isCurrentMonth = dayNd.getYear() === currentBsYear && dayNd.getMonth() === currentBsMonth;
            primaryDateText = dayNd.format("D");
            secondaryDateText = format(day, "d");
          } else {
            isCurrentMonth = isSameMonth(day, monthStart);
            primaryDateText = format(day, "d");
            secondaryDateText = new NepaliDate(day).format("D");
          }

          const isTodayDate = isToday(day);
          const status = getHolidayStatus(day);
          const isFullHoliday = status.type === "FULL";
          const isHalfHoliday = status.type === "HALF";

          return (
            <div
              key={day.toString()}
              onClick={() => {
                if (onDateClick) {
                  onDateClick(day);
                }
              }}
              className={`relative rounded-xl md:rounded-2xl p-1 md:p-2 h-full min-h-[60px] md:min-h-[100px] flex flex-col group transition-all ring-1 ring-inset ${
                isCurrentMonth
                  ? isFullHoliday
                    ? "bg-holiday-bg ring-holiday/20 hover:ring-holiday/50"
                    : isHalfHoliday
                      ? `bg-opacity-10 ring-opacity-20 hover:ring-opacity-50` 
                      : "bg-background ring-border hover:ring-primary/50"
                  : "bg-muted/50 ring-transparent text-muted-foreground/50"
              } cursor-pointer`}
              style={isCurrentMonth && isHalfHoliday ? { 
                backgroundColor: `${status.config?.color}11`,
                boxShadow: `inset 0 0 0 1px ${status.config?.color}33`
              } : {}}
            >
              <div className="flex justify-between items-start mb-1 md:mb-2">
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
                  {primaryDateText}
                </span>
                
                <span className={`text-[9px] md:text-[11px] font-black opacity-40 mt-1 md:mt-2 pr-1 ${isCurrentMonth ? (isFullHoliday ? 'text-holiday' : 'text-foreground') : 'text-muted-foreground'}`}>
                   {secondaryDateText}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 items-center md:items-stretch overflow-hidden overflow-y-auto custom-scrollbar relative z-10">
                {/* Specific DB Holidays */}
                {apiHolidays
                  .filter(h => h.date === format(day, "yyyy-MM-dd"))
                  .map(holiday => (
                    <div key={`h-${holiday.id}`} className="hidden md:block px-2 py-0.5 bg-holiday/10 text-[10px] font-bold text-holiday rounded border border-holiday/20 truncate w-full">
                      {holiday.title}
                    </div>
                  ))
                }

                {/* API Events */}
                {apiEvents
                  .filter(e => e.start_time.startsWith(format(day, "yyyy-MM-dd")))
                  .map(event => (
                    <React.Fragment key={event.id}>
                      <div className="md:hidden w-1.5 h-1.5 rounded-full bg-primary mt-0.5" title={event.title}></div>
                      <div className="hidden md:block px-2 py-1 bg-primary/10 text-[10px] font-bold text-primary rounded-lg border border-primary/20 truncate w-full" title={event.title}>
                        {event.is_all_day ? `All Day: ${event.title}` : event.title}
                      </div>
                    </React.Fragment>
                  ))
                }
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
