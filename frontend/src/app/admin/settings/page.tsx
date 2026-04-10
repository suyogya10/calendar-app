"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, AlertTriangle, Clock } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminSettingsPage() {
  const { settings, updateSettings, refreshApiData } = useConfig();
  
  const [holidayDays, setHolidayDays] = useState<number[]>([6]);
  const [halfDayDays, setHalfDayDays] = useState<number[]>([]);
  const [siteName, setSiteName] = useState("KIOCH Calendar");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [halfWorkStart, setHalfWorkStart] = useState("09:00");
  const [halfWorkEnd, setHalfWorkEnd] = useState("13:00");

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setLogoUrl(settings.logoUrl);
      setWorkStart(settings.workStart);
      setWorkEnd(settings.workEnd);
      setHalfWorkStart(settings.halfWorkStart);
      setHalfWorkEnd(settings.halfWorkEnd);
      setHolidayDays(settings.holidayDays);
      setHalfDayDays(settings.halfDayDays || []);
    }
  }, [settings]);

  const toggleDay = (dayIndex: number) => {
    setHolidayDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
    // If it's a holiday, it can't be a half-day
    if (!holidayDays.includes(dayIndex)) {
      setHalfDayDays(prev => prev.filter(d => d !== dayIndex));
    }
  };

  const toggleHalfDay = (dayIndex: number) => {
    setHalfDayDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
    // If it's a half-day, it can't be a full holiday
    if (!halfDayDays.includes(dayIndex)) {
      setHolidayDays(prev => prev.filter(d => d !== dayIndex));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        siteName,
        logoUrl,
        workStart,
        workEnd,
        halfWorkStart,
        halfWorkEnd,
        holidayDays,
        halfDayDays
      });
      await refreshApiData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Settings</h1>
        <p className="text-sm font-semibold text-muted-foreground mt-1">Configure system-wide preferences and working hours.</p>
      </div>

      {/* General Settings */}
      <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-base font-black text-foreground mb-5">General Data</h2>
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Logo Upload Section */}
          <div className="flex flex-col gap-3 shrink-0">
            <label className="text-sm font-bold text-foreground">Site Logo / Favicon</label>
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden relative group">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">No Logo</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setLogoUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload Logo"
                />
                <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex pointer-events-none">
                   <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
              {logoUrl && (
                <button onClick={() => setLogoUrl(undefined)} className="mb-2 p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground">Click the box to upload.</p>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-foreground">Site / Organization Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
            />
          </div>

        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-base font-black text-foreground mb-1">Working Hours Configuration</h2>
        <p className="text-xs font-semibold text-muted-foreground mb-5">These will define the active slots on your Weekly and Daily calendar views.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-muted/10">
            <div className="flex items-center gap-2 text-primary font-black mb-1">
              <Clock className="w-5 h-5" /> Normal Working Day
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Time</label>
                <input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">End Time</label>
                <input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 rounded-2xl border-2 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-2 text-green-600 font-black mb-1">
              <Clock className="w-5 h-5" /> Half-Day Working Hours
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-green-700/60 uppercase tracking-wider">half day start</label>
                <input type="time" value={halfWorkStart} onChange={(e) => setHalfWorkStart(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-green-500/30 rounded-xl text-sm font-semibold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-bold text-green-700/60 uppercase tracking-wider">half day end</label>
                <input type="time" value={halfWorkEnd} onChange={(e) => setHalfWorkEnd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-green-500/30 rounded-xl text-sm font-semibold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekend Configuration */}
        <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-black text-foreground">Global Weekend Days</h2>
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                Select which days are routine public holidays (like Saturdays in Nepal).
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-holiday bg-holiday/10 border border-holiday/20 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              {holidayDays.length}
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {DAYS.map((day, index) => {
              const isSelected = holidayDays.includes(index);
              return (
                <button
                  key={`holiday-${day}`}
                  onClick={() => toggleDay(index)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-bold text-[10px] transition-all active:scale-95 ${
                    isSelected
                      ? "bg-holiday/10 text-holiday border-holiday/30 shadow-sm"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{isSelected ? "🔴" : "⬜"}</span>
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Half-Day Configuration */}
        <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-black text-foreground">Global Week Half Days</h2>
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                Select which days are recurring half-days (colored green in calendar).
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              {halfDayDays.length}
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {DAYS.map((day, index) => {
              const isSelected = halfDayDays.includes(index);
              return (
                <button
                  key={`half-${day}`}
                  onClick={() => toggleHalfDay(index)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-bold text-[10px] transition-all active:scale-95 ${
                    isSelected
                      ? "bg-green-500/10 text-green-600 border-green-500/30 shadow-sm"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{isSelected ? "🟢" : "⬜"}</span>
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {saved ? (
           <p className="text-sm font-bold text-green-600 px-4 py-2 bg-green-500/10 rounded-xl">✓ All settings persisted system-wide.</p>
        ) : <div />}
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 ${
            saved
              ? "bg-secondary text-secondary-foreground shadow-none"
              : "bg-primary text-primary-foreground shadow-primary/30 hover:opacity-90 hover:-translate-y-0.5"
          } disabled:opacity-50 disabled:scale-100 disabled:translate-y-0`}
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "Saving..." : saved ? "Settings Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
