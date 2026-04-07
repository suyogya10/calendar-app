"use client";

import React, { useRef, useEffect } from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
  isSaturday
} from "date-fns";

interface WeekViewProps {
  currentDate: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate }) => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  const hoursInDay = Array.from({ length: 24 }, (_, i) => i);

  // Auto-scroll to current time approx
  useEffect(() => {
    if (timeContainerRef.current) {
      const currentHour = new Date().getHours();
      timeContainerRef.current.scrollTop = (currentHour * 80) - 100;
    }
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-background">
      {/* Horizontally scrollable container for mobile */}
      <div className="flex-1 overflow-auto custom-scrollbar relative" ref={timeContainerRef}>
        <div className="min-w-[800px] md:min-w-full flex flex-col min-h-max">
          
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-20 flex bg-background/90 backdrop-blur-xl border-b border-border">
            {/* Time gutter spacer */}
            <div className="w-16 md:w-20 shrink-0 bg-background/90 backdrop-blur-xl border-r border-border" />
            
            <div className="flex-1 grid grid-cols-7">
              {daysInWeek.map((day) => (
                 <div key={day.toString()} className={`flex flex-col items-center justify-center py-3 border-r border-border last:border-r-0 ${isSaturday(day) ? 'bg-holiday-bg/50' : ''}`}>
                   <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSaturday(day) ? 'text-holiday' : 'text-muted-foreground'}`}>{format(day, "EEE")}</span>
                   <span className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full md:rounded-2xl text-sm md:text-base font-black transition-all ${
                     isToday(day) 
                       ? "bg-primary text-primary-foreground shadow-md shadow-primary/40" 
                       : isSaturday(day) ? "bg-holiday-bg text-holiday" : "bg-muted text-foreground"
                   }`}>
                     {format(day, "d")}
                   </span>
                 </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 relative min-h-[1920px]"> {/* 24 hours * 80px */}
            {/* Time sidebar */}
            <div className="w-16 md:w-20 shrink-0 border-r border-border bg-muted/30 flex flex-col">
              {hoursInDay.map((hour) => (
                <div key={hour} className="h-[80px] relative">
                  <span className="absolute -top-2.5 right-2 text-[10px] md:text-xs font-bold text-muted-foreground bg-background px-1">
                     {format(new Date().setHours(hour, 0), "h a")}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid columns */}
            <div className="flex-1 grid grid-cols-7 relative">
               {/* Hour horizontal guides */}
               <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {hoursInDay.map((hour) => (
                    <div key={hour} className="h-[80px] border-t border-border group-hover:border-border/80 transition-colors" />
                  ))}
               </div>

               {/* Days columns */}
               {daysInWeek.map((day) => (
                 <div key={day.toString()} className={`relative border-r border-border last:border-r-0 h-full ${isSaturday(day) ? 'bg-holiday-bg/20' : ''}`}>
                    {isToday(day) && (
                      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    )}
                    
                    {/* Placeholder Event */}
                    {isToday(day) && (
                       <div className="absolute top-[800px] left-1 right-1 h-[80px] bg-primary rounded-lg md:rounded-xl shadow-lg shadow-primary/20 p-1.5 md:p-2 text-primary-foreground overflow-hidden ring-1 ring-white/20 active:scale-95 transition-transform cursor-pointer">
                          <span className="block opacity-80 text-[9px] font-bold">10 AM</span>
                          <span className="block text-xs font-black leading-tight truncate">Sync</span>
                       </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
