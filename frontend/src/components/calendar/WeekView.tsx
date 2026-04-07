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
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-white">
      {/* Horizontally scrollable container for mobile */}
      <div className="flex-1 overflow-auto custom-scrollbar relative" ref={timeContainerRef}>
        <div className="min-w-[800px] md:min-w-full flex flex-col min-h-max">
          
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-20 flex bg-white/90 backdrop-blur-xl border-b border-zinc-200">
            {/* Time gutter spacer */}
            <div className="w-16 md:w-20 shrink-0 bg-white/90 backdrop-blur-xl border-r border-zinc-50" />
            
            <div className="flex-1 grid grid-cols-7">
              {daysInWeek.map((day) => (
                 <div key={day.toString()} className={`flex flex-col items-center justify-center py-3 border-r border-zinc-100 last:border-r-0 ${isSaturday(day) ? 'bg-red-50/50' : ''}`}>
                   <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSaturday(day) ? 'text-red-500' : 'text-zinc-400'}`}>{format(day, "EEE")}</span>
                   <span className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full md:rounded-2xl text-sm md:text-base font-black transition-all ${
                     isToday(day) 
                       ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/40" 
                       : isSaturday(day) ? "bg-red-100/50 text-red-600" : "bg-zinc-100/50 text-zinc-900"
                   }`}>
                     {format(day, "d")}
                   </span>
                 </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 relative min-h-[1920px]"> {/* 24 hours * 80px */}
            {/* Time sidebar */}
            <div className="w-16 md:w-20 shrink-0 border-r border-zinc-100 bg-zinc-50/30 flex flex-col">
              {hoursInDay.map((hour) => (
                <div key={hour} className="h-[80px] relative">
                  <span className="absolute -top-2.5 right-2 text-[10px] md:text-xs font-bold text-zinc-400 bg-white px-1">
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
                    <div key={hour} className="h-[80px] border-t border-zinc-100 group-hover:border-zinc-200 transition-colors" />
                  ))}
               </div>

               {/* Days columns */}
               {daysInWeek.map((day) => (
                 <div key={day.toString()} className={`relative border-r border-zinc-100 last:border-r-0 h-full ${isSaturday(day) ? 'bg-red-50/30' : ''}`}>
                    {isToday(day) && (
                      <div className="absolute inset-0 bg-indigo-50/30 pointer-events-none" />
                    )}
                    
                    {/* Placeholder Event */}
                    {isToday(day) && (
                       <div className="absolute top-[800px] left-1 right-1 h-[80px] bg-indigo-600 rounded-lg md:rounded-xl shadow-lg shadow-indigo-500/20 p-1.5 md:p-2 text-white overflow-hidden ring-1 ring-white/20 active:scale-95 transition-transform cursor-pointer">
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
