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
  const isSixWeeks = days.length > 35;

  return (
    <div className={`flex flex-col h-full ${isSixWeeks ? 'p-1 md:p-3 lg:p-6' : 'p-2 md:p-6 lg:p-8'} animate-in fade-in duration-500 overflow-hidden bg-background`}>
      <div className={`grid grid-cols-7 ${isSixWeeks ? 'mb-1 md:mb-2' : 'mb-2 md:mb-4'} border-b border-border pb-2 shrink-0`}>
        {weekDays.map((day, idx) => {
          const isHeaderHoliday = settings.holidayDays.includes(idx);
          const isHeaderHalf = settings.halfDayDays?.includes(idx);
          return (
            <div
              key={day}
              className={`text-center text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                isHeaderHoliday ? "text-holiday" : isHeaderHalf ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.charAt(0)}</span>
            </div>
          );
        })}
      </div>

      <div 
        className={`flex-1 grid grid-cols-7 ${isSixWeeks ? 'gap-1 md:gap-1.5 lg:gap-2' : 'gap-1.5 md:gap-3 lg:gap-4'} overflow-y-auto custom-scrollbar pb-20 md:pb-0`}
        style={{ gridAutoRows: 'minmax(min-content, 1fr)' }}
      >
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

          if (!isCurrentMonth) {
             return <div key={day.toString()} className="ring-1 ring-inset ring-border/10 rounded-xl md:rounded-2xl opacity-20" />;
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
              className={`relative rounded-xl md:rounded-2xl ${isSixWeeks ? 'p-0.5 md:p-1 lg:p-1.5' : 'p-1 md:p-2'} h-full flex flex-col group transition-all ring-1 ring-inset ${
                isFullHoliday
                  ? "bg-holiday-bg ring-holiday/20 hover:ring-holiday/50 border-b-2 md:border-b-0 border-holiday/40"
                  : isHalfHoliday
                    ? `bg-green-500/5 ring-green-500/20 hover:ring-green-500/40 border-b-2 md:border-b-0 border-green-500/30` 
                    : "bg-background ring-border hover:ring-primary/50"
              } cursor-pointer`}
              style={isHalfHoliday ? { 
                backgroundColor: `${status.config?.color}11`,
                boxShadow: `inset 0 0 0 1px ${status.config?.color}33`
              } : {}}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-1 mb-1 md:mb-2">
                <span
                  className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full md:rounded-xl text-[10px] md:text-sm font-bold transition-all shrink-0 ${
                    isTodayDate
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 md:scale-110"
                      : isFullHoliday ? "text-holiday" : "text-foreground"
                  }`}
                  style={isHalfHoliday && !isTodayDate ? { color: status.config?.color } : {}}
                >
                  {primaryDateText}
                </span>
                
                <span className={`text-[8px] md:text-[11px] font-black opacity-40 pr-1 truncate ${isFullHoliday ? 'text-holiday' : 'text-foreground'}`}>
                   {secondaryDateText}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 items-stretch overflow-hidden relative z-10">
                {/* Specific DB Holidays */}
                {apiHolidays
                  .filter(h => h.date === format(day, "yyyy-MM-dd"))
                  .map(holiday => (
                    <div key={`h-${holiday.id}`} className={`hidden md:block px-2 py-0.5 bg-holiday/10 ${isSixWeeks ? 'text-[8px]' : 'text-[9px]'} font-black text-holiday rounded border border-holiday/20 truncate w-full uppercase`}>
                      {holiday.title}
                    </div>
                  ))
                }

                {/* API Events */}
                {apiEvents
                  .filter(e => e.start_time.startsWith(format(day, "yyyy-MM-dd")))
                  .map(event => (
                    <React.Fragment key={event.id}>
                      <div className="md:hidden w-4 h-1 rounded-full bg-primary mt-0.5" title={event.title}></div>
                      <div className={`hidden md:block px-2 py-0.5 bg-primary/10 ${isSixWeeks ? 'text-[8px]' : 'text-[9px]'} font-black text-primary rounded border border-primary/20 truncate w-full uppercase`} title={event.title}>
                        {event.title}
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
