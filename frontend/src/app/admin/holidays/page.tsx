"use client";

import React, { useState } from "react";
import { useConfig, HolidayType, HalfDayConfig } from "@/context/ConfigContext";
import { 
  Save, 
  Calendar as CalendarIcon, 
  Clock, 
  Palette, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const COLORS = [
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Brand Blue", value: "#2d3891", class: "bg-primary" },
  { name: "Brand Green", value: "#8fc742", class: "bg-secondary" },
];

export default function AdminHolidaysPage() {
  const { holidays, halfHolidays, updateHolidays, updateHalfDay, apiHolidays } = useConfig();
  const [localHolidays, setLocalHolidays] = useState<number[]>(holidays);
  const [localHalfDays, setLocalHalfDays] = useState<Record<number, HalfDayConfig>>(halfHolidays);
  const [isSaved, setIsSaved] = useState(false);

  const toggleFullHoliday = (dayIndex: number) => {
    setLocalHolidays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    );
    // If it was a half day, remove it
    if (localHalfDays[dayIndex]) {
      const next = { ...localHalfDays };
      delete next[dayIndex];
      setLocalHalfDays(next);
    }
  };

  const toggleHalfHoliday = (dayIndex: number) => {
    if (localHalfDays[dayIndex]) {
      const next = { ...localHalfDays };
      delete next[dayIndex];
      setLocalHalfDays(next);
    } else {
      setLocalHalfDays({
        ...localHalfDays,
        [dayIndex]: { start: "09:00", end: "13:00", color: "#8fc742" }
      });
      // If it was a full holiday, remove it
      setLocalHolidays(prev => prev.filter(d => d !== dayIndex));
    }
  };

  const updateHalfDayConfig = (dayIndex: number, key: keyof HalfDayConfig, value: string) => {
    setLocalHalfDays({
      ...localHalfDays,
      [dayIndex]: { ...localHalfDays[dayIndex], [key]: value }
    });
  };

  const handleSave = () => {
    updateHolidays(localHolidays);
    // Clear old half days and set new ones
    Object.keys(halfHolidays).forEach(d => updateHalfDay(Number(d), null));
    Object.entries(localHalfDays).forEach(([d, config]) => updateHalfDay(Number(d), config));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Holiday Management</h1>
          <p className="text-muted-foreground mt-1 font-semibold text-sm">Configure recurring holidays and half-day working hours.</p>
        </div>
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
            isSaved 
              ? "bg-secondary text-secondary-foreground shadow-secondary/30" 
              : "bg-primary text-primary-foreground shadow-primary/30 hover:opacity-90"
          }`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {isSaved ? "Saved Successfully" : "Save Configurations"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Weekly Schedule
              </h2>
            </div>
            <div className="divide-y divide-border">
              {DAYS.map((day, index) => {
                const isFull = localHolidays.includes(index);
                const halfConfig = localHalfDays[index];
                const isHalf = !!halfConfig;
                
                return (
                  <div key={day} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-foreground">{day}</span>
                      <div className="flex items-center gap-2">
                        {isFull && <span className="text-[10px] font-black uppercase text-holiday bg-holiday/10 px-2 py-0.5 rounded-lg">Full Holiday</span>}
                        {isHalf && <span className="text-[10px] font-black uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg">Half Day ({halfConfig.start} - {halfConfig.end})</span>}
                        {!isFull && !isHalf && <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">Regular Work Day</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFullHoliday(index)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          isFull 
                            ? "bg-holiday text-holiday-foreground shadow-md shadow-holiday/20" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        Full Holiday
                      </button>
                      <button
                        onClick={() => toggleHalfHoliday(index)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          isHalf 
                            ? "bg-secondary text-secondary-foreground shadow-md shadow-secondary/20" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                        }`}
                      >
                        Half Day
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configurations Column */}
        <div className="space-y-6">
          <div className="bg-background border border-border rounded-3xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Configure Half Days
            </h2>
            
            {Object.keys(localHalfDays).length === 0 ? (
              <div className="py-8 text-center px-4 border-2 border-dashed border-border rounded-2xl">
                <HelpCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">Select a "Half Day" from the schedule to configure its hours and appearance.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(localHalfDays).map(([dayIdx, config]) => (
                  <div key={dayIdx} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-primary uppercase text-xs tracking-widest">{DAYS[Number(dayIdx)]}</h3>
                      <div className="h-px flex-1 bg-border mx-4" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Start Hour</label>
                        <input 
                          type="time" 
                          value={config.start}
                          onChange={(e) => updateHalfDayConfig(Number(dayIdx), "start", e.target.value)}
                          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">End Hour</label>
                        <input 
                          type="time" 
                          value={config.end}
                          onChange={(e) => updateHalfDayConfig(Number(dayIdx), "end", e.target.value)}
                          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase ml-1">
                        <Palette className="w-3 h-3" />
                        Calendar Shading
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateHalfDayConfig(Number(dayIdx), "color", color.value)}
                            title={color.name}
                            className={`h-8 rounded-lg transition-all ${color.class} ${
                              config.color === color.value 
                                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-90" 
                                : "hover:scale-105 opacity-80"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-holiday/5 border border-holiday/10 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-holiday shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-holiday uppercase">Important</p>
                <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                  Full holidays will shade the entire day in Red. Half days will allow events during work hours and record restricted hours visually.
                </p>
              </div>
            </div>
          </div>
          
          {/* Specific Holidays Table */}
          <div className="bg-background border border-border rounded-3xl p-6 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Specific Holidays
              </h2>
              <button 
                onClick={() => {
                  import("@/lib/api").then(({ fetchApi }) => {
                    fetchApi("/holidays/export-excel").then(blob => {
                       if (blob instanceof Blob) {
                         const url = window.URL.createObjectURL(blob);
                         const link = document.createElement('a');
                         link.href = url;
                         link.setAttribute('download', 'holidays.xlsx');
                         document.body.appendChild(link);
                         link.click();
                         link.remove();
                       }
                    }).catch(console.error);
                  });
                }}
                className="text-[10px] bg-muted px-3 py-1.5 rounded uppercase font-bold tracking-wider hover:bg-muted/80"
              >
                Export Excel
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground font-black">
                    <th className="p-2">Title</th>
                    <th className="p-2">Date (AD)</th>
                    <th className="p-2">Date (BS)</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {apiHolidays.map(hol => (
                    <tr key={hol.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="p-2 text-xs font-bold">{hol.title}</td>
                      <td className="p-2 text-xs text-muted-foreground">{hol.date}</td>
                      <td className="p-2 text-xs text-muted-foreground">{hol.bs_date_nepali}</td>
                      <td className="p-2 text-right">
                        <button 
                          onClick={() => {
                            if (!confirm("Delete holiday?")) return;
                            import("@/lib/api").then(({ fetchApi }) => {
                              fetchApi(`/holidays/${hol.id}`, { method: "DELETE" })
                                .then(() => window.location.reload());
                            });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                  {apiHolidays.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-xs text-muted-foreground">No specific holidays found from API.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
