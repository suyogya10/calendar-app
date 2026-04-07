"use client";

import React, { useRef, useEffect } from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  startOfWeek
} from "date-fns";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";

interface WeekViewProps {
  currentDate: Date;
  onSlotClick?: (date: Date, time: string) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, onSlotClick }) => {
  const { getHolidayStatus } = useConfig();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  const hoursInDay = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    if (timeContainerRef.current) {
      const currentHour = new Date().getHours();
      timeContainerRef.current.scrollTop = (currentHour * 80) - 100;
    }
  }, []);

  const handleSlotClick = (day: Date, hour: number) => {
    if (isAdmin && onSlotClick) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      onSlotClick(day, timeStr);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-background">
      <div className="flex-1 overflow-auto custom-scrollbar relative" ref={timeContainerRef}>
        <div className="min-w-[800px] md:min-w-full flex flex-col min-h-max">
          
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-20 flex bg-background/90 backdrop-blur-xl border-b border-border">
            <div className="w-16 md:w-20 shrink-0 bg-background/90 backdrop-blur-xl border-r border-border" />
            
            <div className="flex-1 grid grid-cols-7">
              {daysInWeek.map((day) => {
                const status = getHolidayStatus(day);
                const isFullHoliday = status.type === "FULL";
                const isHalfHoliday = status.type === "HALF";
                
                return (
                  <div 
                    key={day.toString()} 
                    className={`flex flex-col items-center justify-center py-3 border-r border-border last:border-r-0 ${
                      isFullHoliday ? 'bg-holiday-bg/50' : ''
                    }`}
                    style={isHalfHoliday ? { backgroundColor: `${status.config?.color}15` } : {}}
                  >
                    <span 
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                        isFullHoliday ? 'text-holiday' : 'text-muted-foreground'
                      }`}
                      style={isHalfHoliday ? { color: status.config?.color } : {}}
                    >
                      {format(day, "EEE")}
                    </span>
                    <span className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full md:rounded-2xl text-sm md:text-base font-black transition-all ${
                      isToday(day) 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/40" 
                        : isFullHoliday ? "bg-holiday-bg text-holiday" : "bg-muted text-foreground"
                    }`}>
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-1 relative min-h-[1920px]">
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
                    <div key={hour} className="h-[80px] border-t border-border" />
                  ))}
               </div>

               {/* Days columns */}
               {daysInWeek.map((day) => {
                 const status = getHolidayStatus(day);
                 const isFullHoliday = status.type === "FULL";
                 const isHalfHoliday = status.type === "HALF";
                 
                 return (
                   <div 
                     key={day.toString()} 
                     className={`relative border-r border-border last:border-r-0 h-full ${
                       isFullHoliday ? 'bg-holiday-bg/20' : ''
                     }`}
                     style={isHalfHoliday ? { backgroundColor: `${status.config?.color}08` } : {}}
                   >
                     {isToday(day) && (
                       <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                     )}
                     
                     {/* Clickable hour slots for admins */}
                     {isAdmin && hoursInDay.map((hour) => (
                       <div 
                         key={hour} 
                         onClick={() => handleSlotClick(day, hour)} 
                         className="absolute left-0 right-0 h-[80px] cursor-pointer hover:bg-primary/5 transition-colors z-10"
                         style={{ top: `${hour * 80}px` }}
                       />
                     ))}

                     {/* Half-day shading for non-working hours */}
                     {isHalfHoliday && status.config && (() => {
                       const endHour = parseInt(status.config.end.split(":")[0]);
                       return (
                         <div 
                           className="absolute left-0 right-0 bottom-0 pointer-events-none opacity-30"
                           style={{ 
                             top: `${endHour * 80}px`,
                             backgroundColor: status.config.color,
                             backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)'
                           }}
                         />
                       );
                     })()}
                     
                     {/* Placeholder Event */}
                     {isToday(day) && (
                        <div className="absolute top-[800px] left-1 right-1 h-[80px] bg-primary rounded-lg md:rounded-xl shadow-lg shadow-primary/20 p-1.5 md:p-2 text-primary-foreground overflow-hidden ring-1 ring-white/20 active:scale-95 transition-transform cursor-pointer z-20">
                           <span className="block opacity-80 text-[9px] font-bold">10 AM</span>
                           <span className="block text-xs font-black leading-tight truncate">Sync</span>
                        </div>
                     )}
                  </div>
                 );
               })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
