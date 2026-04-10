"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, Type, AlignLeft, Globe, Save, Pencil, Flag, Sun, Users } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useConfig, ApiEvent, ApiHoliday } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import NepaliDate from "nepali-datetime";

// Reads API datetime strings ("YYYY-MM-DD HH:MM:SS") as local time,
// avoiding the UTC→local shift that new Date() / parseISO() would cause.
function parseLocal(dtStr: string | null | undefined): Date | null {
  if (!dtStr) return null;
  const s = dtStr.replace('T', ' ').slice(0, 19);
  const [datePart, timePart = '00:00:00'] = s.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: (ApiEvent | ApiHoliday) | null;
  selectedDate?: Date;
  initialTime?: string;
  onSaved?: () => void;
}

type HolidayType = "FULL" | "HALF";

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-primary" : "bg-muted border border-border"}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

export function EventModal({ isOpen, onClose, eventToEdit, selectedDate, initialTime, onSaved }: EventModalProps) {
  const { role, user } = useAuth();
  const isAdmin = role === "ADMIN";
  const { refreshApiData } = useConfig();
  const isEditMode = !!eventToEdit;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(selectedDate || new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(initialTime || "09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isPublic, setIsPublic] = useState(isAdmin); // Admins default to public, others to private
  const [department, setDepartment] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayType, setHolidayType] = useState<HolidayType>("FULL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only admins get to see/choose all departments
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);

  useEffect(() => {
      const loadDepts = async () => {
        try {
          if (isAdmin) {
             const data = await fetchApi("/users/departments");
             setAvailableDepartments(data || []);
          } else if (user?.department) {
             setAvailableDepartments([user.department]);
          }
        } catch (e) {
          console.error("Failed to load departments", e);
        }
      };
      loadDepts();
  }, [isOpen, isAdmin, user]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && eventToEdit) {
      if ('type' in eventToEdit) {
        // It's a Holiday
        const start = parseLocal(eventToEdit.date + " 00:00:00");
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || "");
        setDate(start ? format(start, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
        setStartTime("09:00");
        setEndTime("10:00");
        setIsAllDay(true);
        setIsPublic(true);
        setDepartment("");
        setIsHoliday(true);
        setHolidayType((eventToEdit.type as HolidayType) || "FULL");
      } else {
        // It's an Event
        const start = parseLocal(eventToEdit.start_time);
        const end = parseLocal(eventToEdit.end_time);
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || "");
        setDate(start ? format(start, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
        setStartTime(start ? format(start, "HH:mm") : "09:00");
        setEndTime(end ? format(end, "HH:mm") : "10:00");
        setIsAllDay(eventToEdit.is_all_day);
        setIsPublic(eventToEdit.is_public);
        setDepartment(eventToEdit.department || "");
        setIsHoliday(false);
        setHolidayType("FULL");
      }
    } else {
      setTitle("");
      setDescription("");
      setDate(format(selectedDate || new Date(), "yyyy-MM-dd"));
      setStartTime(initialTime || "09:00");
      setEndTime("10:00");
      setIsAllDay(false);
      setIsPublic(isAdmin);
      setDepartment("");
      setIsHoliday(false);
      setHolidayType("FULL");
    }
    setError("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventToEdit]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (isHoliday) {
        // Create / update a Holiday
        const body = { title, date, type: holidayType, description };
        if (isEditMode && eventToEdit) {
          if ('type' in eventToEdit) {
            // Already a holiday, update it
            await fetchApi(`/holidays/${eventToEdit.id}`, { method: "PUT", body: JSON.stringify(body) });
          } else {
            // editing an event but marked as holiday: create holiday, delete event
            await fetchApi("/holidays", { method: "POST", body: JSON.stringify(body) });
            await fetchApi(`/events/${eventToEdit.id}`, { method: "DELETE" });
          }
        } else {
          await fetchApi("/holidays", { method: "POST", body: JSON.stringify(body) });
        }
      } else {
        // Create / update an Event
        const startDateTime = isAllDay ? `${date} 00:00:00` : `${date} ${startTime}:00`;
        const endDateTime = isAllDay ? `${date} 23:59:00` : `${date} ${endTime}:00`;
        const body = { 
          title, 
          description, 
          start_time: startDateTime, 
          end_time: endDateTime, 
          is_all_day: isAllDay, 
          is_public: isPublic,
          department: isPublic ? null : (department || null)
        };

        if (isEditMode && eventToEdit) {
          if ('type' in eventToEdit) {
             // editing a holiday but marked as event: create event, delete holiday
             await fetchApi("/events", { method: "POST", body: JSON.stringify(body) });
             await fetchApi(`/holidays/${eventToEdit.id}`, { method: "DELETE" });
          } else {
             // Already an event, update it
             await fetchApi(`/events/${eventToEdit.id}`, { method: "PUT", body: JSON.stringify(body) });
          }
        } else {
          await fetchApi("/events", { method: "POST", body: JSON.stringify(body) });
        }
      }

      await refreshApiData();
      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-background border border-border shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b border-border shrink-0 transition-colors ${isHoliday ? (holidayType === "FULL" ? "bg-red-500/10" : "bg-green-500/10") : "bg-muted/30"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${isHoliday ? (holidayType === "FULL" ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-600") : "bg-primary/10 text-primary"}`}>
                  {isHoliday ? <Flag className="w-5 h-5" /> : isEditMode ? <Pencil className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">
                    {isHoliday
                      ? (holidayType === "FULL" ? "Mark as Full Holiday" : "Mark as Half Holiday")
                      : isEditMode ? "Edit Event" : "Create Event"}
                  </h2>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                    {isHoliday ? "Applies to the public calendar" : isEditMode ? "Update event details" : "Add to your calendar"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors active:scale-90">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Holiday Toggle (Admin Only) */}
              {isAdmin && (
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isHoliday ? (holidayType === "FULL" ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20") : "bg-muted/30 border-border"}`}>
                  <div className="flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${isHoliday ? (holidayType === "FULL" ? "text-red-500" : "text-green-600") : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">Mark as Holiday</p>
                      <p className="text-xs text-muted-foreground">Saves as a calendar holiday instead of event</p>
                    </div>
                  </div>
                  <Toggle value={isHoliday} onChange={() => setIsHoliday(!isHoliday)} />
                </div>
              )}

              {/* Holiday Type Selector (shown when isHoliday) */}
              {isHoliday && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => setHolidayType("FULL")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${holidayType === "FULL" ? "border-red-500 bg-red-500/10 text-red-600" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${holidayType === "FULL" ? "bg-red-500" : "bg-muted-foreground/20"}`}>
                      <Flag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black">Full Holiday</span>
                    <span className="text-[10px] font-semibold opacity-70 text-center">Whole day off — shown in red</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHolidayType("HALF")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${holidayType === "HALF" ? "border-green-500 bg-green-500/10 text-green-700" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${holidayType === "HALF" ? "bg-green-500" : "bg-muted-foreground/20"}`}>
                      <Sun className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black">Half Holiday</span>
                    <span className="text-[10px] font-semibold opacity-70 text-center">Partial day off — shown in green</span>
                  </button>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  {isHoliday ? "Holiday Name" : "Event Title"}
                </label>
                <input
                  type="text"
                  placeholder={isHoliday ? "e.g. Dashain, New Year…" : "What's happening?"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>

              {/* Description (hidden for holiday) */}
              {!isHoliday && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <AlignLeft className="w-4 h-4 text-muted-foreground" />Description (optional)
                  </label>
                  <textarea
                    placeholder="Add details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>
              )}

              {/* Date Picker */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>

              {/* Time + All-day — only for regular events */}
              {!isHoliday && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground cursor-pointer" onClick={() => setIsAllDay(!isAllDay)}>
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />All Day Event
                    </label>
                    <Toggle value={isAllDay} onChange={() => setIsAllDay(!isAllDay)} />
                  </div>

                  {!isAllDay && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Start Time</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">End Time</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                      </div>
                    </div>
                  )}

                  {/* Public Toggle */}
                  <div className="space-y-4">
                    {isAdmin && (
                      <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-bold text-foreground">Public Event</p>
                            <p className="text-xs text-muted-foreground">Visible on the public calendar</p>
                          </div>
                        </div>
                        <Toggle value={isPublic} onChange={() => setIsPublic(!isPublic)} />
                      </div>
                    )}

                    {!isPublic && (
                       <div className="space-y-2 p-4 bg-muted/20 border border-border rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            Share with Department
                          </label>
                          <select 
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="">Personal (Private)</option>
                            {availableDepartments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <p className="text-[10px] font-semibold text-muted-foreground px-1 italic">
                            * Shared events are visible to everyone in the selected department.
                          </p>
                       </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3 shrink-0">
              <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title || isSubmitting}
                className={`flex items-center gap-2 px-8 py-2.5 text-white text-sm font-black rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none ${
                  isHoliday
                    ? holidayType === "FULL" ? "bg-red-500 shadow-red-500/30" : "bg-green-600 shadow-green-600/30"
                    : "bg-primary shadow-primary/30"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isHoliday ? "Save Holiday" : isEditMode ? "Update Event" : "Save Event"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
