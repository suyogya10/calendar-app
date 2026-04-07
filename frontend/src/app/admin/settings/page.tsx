"use client";

import React, { useState } from "react";
import { Save, Plus, Trash2, AlertTriangle } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminSettingsPage() {
  const [holidayDays, setHolidayDays] = useState<number[]>([6]); // Saturday by default
  const [siteName, setSiteName] = useState("KIOCH Calendar");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [saved, setSaved] = useState(false);

  const toggleDay = (dayIndex: number) => {
    setHolidayDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Settings</h1>
        <p className="text-sm font-semibold text-muted-foreground mt-1">Configure system-wide preferences.</p>
      </div>

      {/* General Settings */}
      <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-base font-black text-foreground mb-5">General</h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Site / Organization Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Work Day Start</label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Work Day End</label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Configuration */}
      <div className="bg-background rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-black text-foreground">Holiday Days</h2>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Selected days will appear highlighted in red across all calendar views.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-holiday bg-holiday/10 border border-holiday/20 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            {holidayDays.length} day{holidayDays.length !== 1 ? "s" : ""} selected
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {DAYS.map((day, index) => {
            const isSelected = holidayDays.includes(index);
            return (
              <button
                key={day}
                onClick={() => toggleDay(index)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-bold text-xs transition-all active:scale-95 ${
                  isSelected
                    ? "bg-holiday/10 text-holiday border-holiday/30 shadow-sm"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-lg">{isSelected ? "🔴" : "⬜"}</span>
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Backend Notice */}
      <div className="bg-muted/30 rounded-2xl border border-border border-dashed p-6 flex items-start gap-4">
        <div className="p-2 bg-accent/10 text-accent rounded-xl border border-accent/20 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">Backend Integration Pending</h3>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Settings changes are currently stored in component state only. Once the backend API is connected, 
            these will be persisted to the database and affect all users system-wide.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
            saved
              ? "bg-secondary text-secondary-foreground shadow-secondary/20"
              : "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90"
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
