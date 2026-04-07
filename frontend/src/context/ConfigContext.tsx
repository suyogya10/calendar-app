"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDay } from "date-fns";

export type HolidayType = "WORK" | "FULL" | "HALF";

export interface HalfDayConfig {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  color: string; // hex or tailwind class
}

interface ConfigContextType {
  holidays: number[]; // [0, 6] etc.
  halfHolidays: Record<number, HalfDayConfig>;
  updateHolidays: (days: number[]) => void;
  updateHalfDay: (day: number, config: HalfDayConfig | null) => void;
  getHolidayStatus: (date: Date) => { type: HolidayType; config?: HalfDayConfig };
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  // Default: Saturdays are full holidays
  const [holidays, setHolidays] = useState<number[]>([6]);
  
  // Default: No half holidays
  const [halfHolidays, setHalfHolidays] = useState<Record<number, HalfDayConfig>>({
    // Example: 5: { start: "09:00", end: "13:00", color: "#8fc742" }
  });

  useEffect(() => {
    const savedHolidays = localStorage.getItem("calendar_holidays");
    if (savedHolidays) setHolidays(JSON.parse(savedHolidays));
    
    const savedHalfHolidays = localStorage.getItem("calendar_half_holidays");
    if (savedHalfHolidays) setHalfHolidays(JSON.parse(savedHalfHolidays));
  }, []);

  const updateHolidays = (days: number[]) => {
    setHolidays(days);
    localStorage.setItem("calendar_holidays", JSON.stringify(days));
  };

  const updateHalfDay = (day: number, config: HalfDayConfig | null) => {
    setHalfHolidays((prev) => {
      const next = { ...prev };
      if (config) {
        next[day] = config;
      } else {
        delete next[day];
      }
      localStorage.setItem("calendar_half_holidays", JSON.stringify(next));
      return next;
    });
  };

  const getHolidayStatus = (date: Date) => {
    const dayIndex = getDay(date);
    if (holidays.includes(dayIndex)) {
      return { type: "FULL" as HolidayType };
    }
    if (halfHolidays[dayIndex]) {
      return { type: "HALF" as HolidayType, config: halfHolidays[dayIndex] };
    }
    return { type: "WORK" as HolidayType };
  };

  return (
    <ConfigContext.Provider value={{ holidays, halfHolidays, updateHolidays, updateHalfDay, getHolidayStatus }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
