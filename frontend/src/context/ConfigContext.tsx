"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDay, format } from "date-fns";
import { fetchApi } from "@/lib/api";

export type HolidayType = "WORK" | "FULL" | "HALF";
export type CalendarMode = "AD" | "BS";

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
  type: "FULL" | "HALF"; // FULL = red all-day, HALF = green half-day
  description: string | null;
  bs_date?: string;
  bs_date_nepali?: string;
}

export interface Settings {
  siteName: string;
  logoUrl?: string;
  workStart: string;
  workEnd: string;
  halfWorkStart: string;
  halfWorkEnd: string;
  holidayDays: number[];
}

interface ConfigContextType {
  settings: Settings;
  apiEvents: ApiEvent[];
  apiHolidays: ApiHoliday[];
  getHolidayStatus: (date: Date) => { type: HolidayType; config?: HalfDayConfig };
  refreshApiData: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
}

export const defaultSettings: Settings = {
  siteName: "KIOCH Calendar",
  workStart: "09:00",
  workEnd: "17:00",
  halfWorkStart: "09:00",
  halfWorkEnd: "13:00",
  holidayDays: [6], // Saturday
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [apiHolidays, setApiHolidays] = useState<ApiHoliday[]>([]);
  const [calendarMode, setCalendarModeState] = useState<CalendarMode>("AD");

  const setCalendarMode = (mode: CalendarMode) => {
    setCalendarModeState(mode);
    localStorage.setItem("calendarMode", mode);
  };

  const refreshApiData = async () => {
    try {
      // 1. Fetch Events & Holidays
      const data = await fetchApi("/public-calendar");
      setApiEvents(data.events || []);
      setApiHolidays(data.holidays || []);

      // 2. Fetch Settings
      const settingsData = await fetchApi("/settings");
      if (settingsData && typeof settingsData === 'object') {
        const pd = { ...defaultSettings };
        if (settingsData.siteName) pd.siteName = settingsData.siteName;
        if (settingsData.logoUrl) pd.logoUrl = settingsData.logoUrl;
        if (settingsData.workStart) pd.workStart = settingsData.workStart;
        if (settingsData.workEnd) pd.workEnd = settingsData.workEnd;
        if (settingsData.halfWorkStart) pd.halfWorkStart = settingsData.halfWorkStart;
        if (settingsData.halfWorkEnd) pd.halfWorkEnd = settingsData.halfWorkEnd;
        if (settingsData.holidayDays) pd.holidayDays = JSON.parse(settingsData.holidayDays);
        setSettings(pd);
      }
    } catch (e) {
      console.error("Failed to fetch public calendar or settings", e);
    }
  };

  useEffect(() => {
    refreshApiData();
    const savedMode = localStorage.getItem("calendarMode") as CalendarMode;
    if (savedMode) setCalendarModeState(savedMode);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = settings.siteName || "KIOCH Calendar";
      
      if (settings.logoUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = settings.logoUrl;
      }
    }
  }, [settings.siteName, settings.logoUrl]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    
    // Convert array back to string payload for backend
    const payload: any = { ...merged };
    payload.holidayDays = JSON.stringify(merged.holidayDays);
    
    try {
      await fetchApi("/settings", { method: "POST", body: JSON.stringify(payload) });
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  const getHolidayStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const isApiHoliday = apiHolidays.some(h => h.date === dateStr);
    
    // Half day style config using backend settings
    const halfDayConfig = { 
      start: settings.halfWorkStart, 
      end: settings.halfWorkEnd, 
      color: "#16a34a" // green
    };

    if (isApiHoliday) {
      const h = apiHolidays.find(h => h.date === dateStr)!;
      if (h.type === "HALF") {
        return { type: "HALF" as HolidayType, config: halfDayConfig };
      }
      return { type: "FULL" as HolidayType };
    }

    const dayIndex = getDay(date);
    if (settings.holidayDays.includes(dayIndex)) {
      return { type: "FULL" as HolidayType };
    }
    
    return { type: "WORK" as HolidayType };
  };

  return (
    <ConfigContext.Provider value={{ settings, apiEvents, apiHolidays, updateSettings, getHolidayStatus, refreshApiData, calendarMode, setCalendarMode }}>
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
