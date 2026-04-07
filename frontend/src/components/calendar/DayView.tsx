"use client";

import React, { useEffect, useRef } from "react";
import {
  format,
  isToday,
} from "date-fns";

interface DayViewProps {
  currentDate: Date;
}

const DayView: React.FC<DayViewProps> = ({ currentDate }) => {
  const hoursInDay = Array.from({ length: 24 }, (_, i) => i);
  const isTodayDate = isToday(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (currentHour * 80) - 100);
    }
  }, [currentDate]);

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300 overflow-hidden bg-white">
      {/* Mobile-optimized Header */}
      <div className="flex-none flex items-center gap-4 p-4 md:p-6 bg-zinc-50/50 border-b border-zinc-100">
        <div className={`flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-2xl shadow-sm transition-all ${
          isTodayDate 
            ? "bg-indigo-600 text-white shadow-indigo-500/30 md:scale-105" 
            : "bg-white text-zinc-900 ring-1 ring-zinc-200"
        }`}>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-90">{format(currentDate, "EEE")}</span>
          <span className="text-2xl md:text-3xl font-black">{format(currentDate, "d")}</span>
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
             {format(currentDate, "MMMM d, yyyy")}
          </h2>
          <p className="text-xs md:text-sm font-semibold text-zinc-400 mt-0.5">
             2 events scheduled
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
        <div className="flex min-h-[1920px]">
          {/* Time sidebar */}
          <div className="w-16 md:w-24 shrink-0 bg-zinc-50/30 flex flex-col border-r border-zinc-100">
            {hoursInDay.map((hour) => (
              <div key={hour} className="h-[80px] relative text-right pr-2">
                <span className="absolute -top-2.5 right-2 md:right-4 text-[10px] md:text-xs font-bold text-zinc-400 tracking-wider bg-white rounded px-1">
                   {format(new Date().setHours(hour, 0), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Grid column */}
          <div className="flex-1 relative pr-2 md:pr-4">
             {/* Hour horizontal guides */}
             <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col pointer-events-none">
                {hoursInDay.map((hour) => (
                  <div key={hour} className="h-[80px] border-t border-zinc-100" />
                ))}
             </div>
             
             {/* Current time line */}
             {isTodayDate && (
               <div 
                 className="absolute left-0 right-0 h-px bg-rose-500 z-10 pointer-events-none flex items-center"
                 style={{ top: `${(new Date().getHours() * 80) + (new Date().getMinutes() / 60 * 80)}px` }}
               >
                 <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1"></div>
               </div>
             )}

             {/* Events layer */}
             <div className="relative h-full z-1 ml-2 md:ml-4">
                {/* Sample events */}
                {isTodayDate && (
                  <>
                    <div className="absolute top-[320px] left-0 right-0 h-[80px] bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20 p-3 text-white ring-2 ring-white cursor-pointer active:scale-[0.98] transition-transform">
                      <span className="text-[9px] md:text-[10px] font-bold opacity-90 uppercase tracking-wider mb-0.5">04:00 AM - 05:00 AM</span>
                      <h3 className="text-sm md:text-base font-black leading-tight">Server Maintenance</h3>
                    </div>

                    <div className="absolute top-[800px] left-0 right-0 h-[160px] bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md shadow-orange-500/20 p-3 text-white ring-2 ring-white mt-1 cursor-pointer active:scale-[0.98] transition-transform">
                      <span className="text-[9px] md:text-[10px] font-bold opacity-90 uppercase tracking-wider mb-0.5">10:00 AM - 12:00 PM</span>
                      <h3 className="text-sm md:text-base font-black leading-tight">Design Review sync</h3>
                      <p className="text-[10px] md:text-xs font-semibold opacity-90 mt-1">Google Meet</p>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
