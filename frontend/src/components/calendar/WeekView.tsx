"use client";

import React, { useRef, useEffect } from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  startOfWeek
} from "date-fns";
import { useConfig, ApiEvent } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";

interface WeekViewProps {
  currentDate: Date;
  onSlotClick?: (date: Date, time: string) => void;
}

/** Parse an API datetime string as LOCAL time (no UTC shift) */
function parseLocal(dtStr: string): Date {
  const s = dtStr.replace("T", " ").slice(0, 19);
  const [datePart, timePart = "00:00:00"] = s.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

interface EventLayout {
  event: ApiEvent;
  top: number;
  height: number;
  col: number;
  totalCols: number;
}

/** Assign non-overlapping side-by-side columns to events that share the same time slot */
function computeLayout(dayEvents: ApiEvent[]): EventLayout[] {
  if (dayEvents.length === 0) return [];

  interface Slot {
    event: ApiEvent;
    startMs: number;
    endMs: number;
    col: number;
    totalCols: number;
    top: number;
    height: number;
  }

  const slots: Slot[] = dayEvents.map(e => {
    const start = parseLocal(e.start_time);
    const end = e.end_time ? parseLocal(e.end_time) : new Date(start.getTime() + 3600000);
    const top = (start.getHours() * 60 + start.getMinutes()) / 60 * 80;
    const height = Math.max(40, (end.getTime() - start.getTime()) / 3600000 * 80);
    return { event: e, startMs: start.getTime(), endMs: end.getTime(), col: 0, totalCols: 1, top, height };
  });

  // Sort by start time
  slots.sort((a, b) => a.startMs - b.startMs);

  // Greedy column assignment
  const colEnds: number[] = [];
  for (const slot of slots) {
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= slot.startMs) {
        colEnds[c] = slot.endMs;
        slot.col = c;
        placed = true;
        break;
      }
    }
    if (!placed) {
      slot.col = colEnds.length;
      colEnds.push(slot.endMs);
    }
  }

  // Calculate totalCols per event (max col among overlapping peers + 1)
  for (const slot of slots) {
    let maxCol = slot.col;
    for (const other of slots) {
      if (other === slot) continue;
      if (other.startMs < slot.endMs && other.endMs > slot.startMs) {
        maxCol = Math.max(maxCol, other.col);
      }
    }
    slot.totalCols = maxCol + 1;
  }

  return slots.map(s => ({
    event: s.event,
    top: s.top,
    height: s.height,
    col: s.col,
    totalCols: s.totalCols,
  }));
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, onSlotClick }) => {
  const { getHolidayStatus, apiEvents } = useConfig();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
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
                    className={`flex flex-col items-center justify-center py-3 border-r border-border last:border-r-0 ${isFullHoliday ? 'bg-holiday-bg/50' : ''}`}
                    style={isHalfHoliday ? { backgroundColor: `${status.config?.color}15` } : {}}
                  >
                    <span 
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isFullHoliday ? 'text-holiday' : 'text-muted-foreground'}`}
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
                 const dayStr = format(day, "yyyy-MM-dd");
                 const dayEvents = apiEvents.filter(e => e.start_time.startsWith(dayStr));
                 const layouts = computeLayout(dayEvents);
                 
                 return (
                   <div 
                     key={day.toString()} 
                     className={`relative border-r border-border last:border-r-0 h-full ${isFullHoliday ? 'bg-holiday-bg/20' : ''}`}
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
                     
                     {/* Events — side-by-side within columns */}
                     {layouts.map(({ event, top, height, col, totalCols }) => {
                       const startDate = parseLocal(event.start_time);
                       const widthPct = 100 / totalCols;
                       const leftPct = col * widthPct;
                       return (
                         <div
                           key={event.id}
                           className="absolute bg-primary rounded-lg shadow-lg shadow-primary/20 p-1.5 text-primary-foreground overflow-hidden ring-1 ring-white/20 cursor-pointer z-20 active:scale-95 transition-transform"
                           style={{
                             top: `${top}px`,
                             height: `${height}px`,
                             left: `calc(${leftPct}% + 2px)`,
                             width: `calc(${widthPct}% - 4px)`,
                           }}
                           title={event.title}
                         >
                           {!event.is_all_day && (
                             <span className="block opacity-80 text-[9px] font-bold">
                               {format(startDate, "h:mm a")}
                             </span>
                           )}
                           <span className="block text-xs font-black leading-tight truncate">{event.title}</span>
                         </div>
                       );
                     })}
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
