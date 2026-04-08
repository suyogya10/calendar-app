"use client";

import React, { useEffect, useRef } from "react";
import { format, isToday } from "date-fns";
import { useConfig, ApiEvent } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";

interface DayViewProps {
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
    const height = Math.max(50, (end.getTime() - start.getTime()) / 3600000 * 80);
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

  // Calculate totalCols: max col among overlapping peers + 1
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

const DayView: React.FC<DayViewProps> = ({ currentDate, onSlotClick }) => {
  const { getHolidayStatus, apiEvents, apiHolidays } = useConfig();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const hoursInDay = Array.from({ length: 24 }, (_, i) => i);
  const isTodayDate = isToday(currentDate);
  const status = getHolidayStatus(currentDate);
  const isFullHoliday = status.type === "FULL";
  const isHalfHoliday = status.type === "HALF";
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayStr = format(currentDate, "yyyy-MM-dd");

  const todayHoliday = apiHolidays.find(h => h.date === dayStr);
  const todayEvents = apiEvents.filter(e => e.start_time.startsWith(dayStr));
  const layouts = computeLayout(todayEvents);

  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (currentHour * 80) - 100);
    }
  }, [currentDate]);

  const handleSlotClick = (hour: number) => {
    if (isAdmin && onSlotClick) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      onSlotClick(currentDate, timeStr);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300 overflow-hidden bg-background">
      {/* Header */}
      <div 
        className={`flex-none flex items-center gap-4 p-4 md:p-6 border-b border-border ${isFullHoliday ? 'bg-holiday-bg/30' : 'bg-muted/50'}`}
        style={isHalfHoliday ? { backgroundColor: `${status.config?.color}12` } : {}}
      >
        <div className={`flex flex-col items-center justify-center h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-2xl shadow-sm transition-all ${
          isTodayDate 
            ? "bg-primary text-primary-foreground shadow-primary/30 md:scale-105" 
            : isFullHoliday
            ? "bg-holiday-bg text-holiday ring-1 ring-holiday/20"
            : "bg-background text-foreground ring-1 ring-border"
        }`}
        style={isHalfHoliday && !isTodayDate ? { backgroundColor: `${status.config?.color}20`, color: status.config?.color, boxShadow: `0 0 0 1px ${status.config?.color}40` } : {}}
        >
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-90">{format(currentDate, "EEE")}</span>
          <span className="text-2xl md:text-3xl font-black">{format(currentDate, "d")}</span>
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight leading-tight">
             {format(currentDate, "MMMM d, yyyy")}
          </h2>
          {todayHoliday && (
            <span className="text-xs font-bold text-holiday bg-holiday/10 px-2 py-0.5 rounded mt-1 w-fit">
              🎉 {todayHoliday.title}{todayHoliday.bs_date_nepali ? ` (${todayHoliday.bs_date_nepali})` : ""}
            </span>
          )}
          <p className="text-xs md:text-sm font-semibold mt-0.5" style={{ color: isHalfHoliday ? status.config?.color : undefined }}>
            {isFullHoliday 
              ? "🔴 Full Holiday" 
              : isHalfHoliday 
                ? `🟡 Half Day — Work hours: ${status.config?.start} – ${status.config?.end}`
                : layouts.length > 0 ? `${layouts.length} event${layouts.length > 1 ? "s" : ""} scheduled` : "No events scheduled"}
            {isAdmin && !isFullHoliday && (
              <span className="ml-2 text-primary/60 text-[10px] font-bold uppercase tracking-widest hidden md:inline">
                Click any slot to add event
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
        <div className="flex min-h-[1920px]">
          {/* Time sidebar */}
          <div className={`w-16 md:w-24 shrink-0 flex flex-col border-r border-border ${isFullHoliday ? 'bg-holiday-bg/20' : 'bg-muted/30'}`}
            style={isHalfHoliday ? { background: `linear-gradient(to bottom, ${status.config?.color}08, transparent)` } : {}}
          >
            {hoursInDay.map((hour) => (
              <div key={hour} className="h-[80px] relative text-right pr-2">
                <span className="absolute -top-2.5 right-2 md:right-4 text-[10px] md:text-xs font-bold text-muted-foreground tracking-wider bg-background px-1">
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
                  <div key={hour} className="h-[80px] border-t border-border" />
                ))}
             </div>
             
             {/* Half-day non-working hours shading */}
             {isHalfHoliday && status.config && (() => {
               const endHour = parseInt(status.config.end.split(":")[0]);
               return (
                 <div 
                   className="absolute left-0 right-0 bottom-0 pointer-events-none opacity-25"
                   style={{ 
                     top: `${endHour * 80}px`,
                     backgroundColor: status.config.color,
                     backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.2) 6px, rgba(0,0,0,0.2) 12px)'
                   }}
                 />
               );
             })()}
             
             {/* Current time line */}
             {isTodayDate && (
               <div 
                 className="absolute left-0 right-0 h-px bg-rose-500 z-10 pointer-events-none flex items-center"
                 style={{ top: `${(new Date().getHours() * 80) + (new Date().getMinutes() / 60 * 80)}px` }}
               >
                 <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1"></div>
               </div>
             )}

             {/* Clickable hour slots for admins */}
             {isAdmin && !isFullHoliday && hoursInDay.map((hour) => {
               const isAfterEnd = isHalfHoliday && status.config && 
                 hour >= parseInt(status.config.end.split(":")[0]);
               return (
                 <div 
                   key={hour}
                   onClick={() => !isAfterEnd && handleSlotClick(hour)}
                   className={`absolute left-0 right-0 h-[80px] z-10 group flex items-center ${
                     isAfterEnd 
                       ? "cursor-not-allowed" 
                       : "cursor-pointer hover:bg-primary/5 transition-colors"
                   }`}
                   style={{ top: `${hour * 80}px` }}
                 >
                   {!isAfterEnd && (
                     <span className="opacity-0 group-hover:opacity-100 ml-3 text-[10px] font-bold text-primary/50 transition-opacity select-none pointer-events-none">
                       + Add event
                     </span>
                   )}
                 </div>
               );
             })}

             {/* Events — side-by-side columns for overlapping events */}
             <div className="absolute inset-0 ml-2 md:ml-4 z-[15]">
               {layouts.map(({ event, top, height, col, totalCols }) => {
                 const startDate = parseLocal(event.start_time);
                 const endDate = event.end_time ? parseLocal(event.end_time) : new Date(startDate.getTime() + 3600000);
                 const widthPct = 100 / totalCols;
                 const leftPct = col * widthPct;
                 return (
                   <div
                     key={event.id}
                     className="absolute bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/20 p-3 ring-2 ring-background cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
                     style={{
                       top: `${top}px`,
                       height: `${height}px`,
                       left: `${leftPct}%`,
                       width: `calc(${widthPct}% - 4px)`,
                     }}
                   >
                     {!event.is_all_day && (
                       <span className="text-[9px] md:text-[10px] font-bold opacity-90 uppercase tracking-wider mb-0.5 block">
                         {format(startDate, "hh:mm a")} – {format(endDate, "hh:mm a")}
                       </span>
                     )}
                     {event.is_all_day && (
                       <span className="text-[9px] md:text-[10px] font-bold opacity-90 uppercase tracking-wider mb-0.5 block">All Day</span>
                     )}
                     <h3 className="text-sm md:text-base font-black leading-tight truncate">{event.title}</h3>
                     {event.description && height > 70 && (
                       <p className="text-[10px] md:text-xs font-semibold opacity-90 mt-1 truncate">{event.description}</p>
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

export default DayView;
