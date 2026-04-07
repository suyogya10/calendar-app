"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDay, format } from "date-fns";
import { fetchApi } from "@/lib/api";

export type HolidayType = "WORK" | "FULL" | "HALF";

export interface HalfDayConfig {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  color: string; // hex or tailwind class
}

export interface ApiEvent {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  is_all_day: boolean;
  is_public: boolean;
  bs_start_time?: string;
  bs_start_time_nepali?: string;
}

export interface ApiHoliday {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  description: string | null;
  bs_date?: string;
  bs_date_nepali?: string;
}

interface ConfigContextType {
  holidays: number[]; // [0, 6] etc.
  halfHolidays: Record<number, HalfDayConfig>;
  apiEvents: ApiEvent[];
  apiHolidays: ApiHoliday[];
  updateHolidays: (days: number[]) => void;
  updateHalfDay: (day: number, config: HalfDayConfig | null) => void;
  getHolidayStatus: (date: Date) => { type: HolidayType; config?: HalfDayConfig };
  refreshApiData: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [holidays, setHolidays] = useState<number[]>([6]);
  const [halfHolidays, setHalfHolidays] = useState<Record<number, HalfDayConfig>>({});
  
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [apiHolidays, setApiHolidays] = useState<ApiHoliday[]>([]);

  const refreshApiData = async () => {
    try {
      const data = await fetchApi("/public-calendar");
      setApiEvents(data.events || []);
      setApiHolidays(data.holidays || []);
    } catch (e) {
      console.error("Failed to fetch public calendar", e);
    }
  };

  useEffect(() => {
    refreshApiData();
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
    // 1. Check API explicit database holidays overrides
    const dateStr = format(date, "yyyy-MM-dd");
    const isApiHoliday = apiHolidays.some(h => h.date === dateStr);
    
    if (isApiHoliday) {
      return { type: "FULL" as HolidayType };
    }

    // 2. Check localized recurring weekly days fallback
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
    <ConfigContext.Provider value={{ holidays, halfHolidays, apiEvents, apiHolidays, updateHolidays, updateHalfDay, getHolidayStatus, refreshApiData }}>
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
