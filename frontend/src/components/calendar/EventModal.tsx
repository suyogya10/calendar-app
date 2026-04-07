"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, Type, AlignLeft, Globe, Save } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialTime?: string;
}

export function EventModal({ isOpen, onClose, selectedDate, initialTime }: EventModalProps) {
  const { refreshApiData } = useConfig();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(initialTime || "09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTime) setStartTime(initialTime);
  }, [initialTime]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const startDateTime = isAllDay ? `${dateStr} 00:00:00` : `${dateStr} ${startTime}:00`;
      const endDateTime = isAllDay ? `${dateStr} 23:59:00` : `${dateStr} ${endTime}:00`;

      await fetchApi("/events", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          start_time: startDateTime,
          end_time: endDateTime,
          is_all_day: isAllDay,
          is_public: isPublic,
        }),
      });

      await refreshApiData();

      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("09:00");
      setEndTime("10:00");
      setIsAllDay(false);
      setIsPublic(true);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-background border border-border shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">Create Event</h2>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Event Title
                </label>
                <input 
                  type="text"
                  placeholder="What's happening?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <AlignLeft className="w-4 h-4 text-muted-foreground" />
                  Description (optional)
                </label>
                <textarea
                  placeholder="Add details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 resize-none"
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground cursor-pointer" onClick={() => setIsAllDay(!isAllDay)}>
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  All Day Event
                </label>
                <button
                  type="button"
                  onClick={() => setIsAllDay(!isAllDay)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAllDay ? 'bg-primary' : 'bg-muted border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isAllDay ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Time Selection (hidden if all day) */}
              {!isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Start Time
                    </label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      End Time
                    </label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Public Event</p>
                    <p className="text-xs text-muted-foreground">Visible on the public calendar</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-muted border border-border'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!title || isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground text-sm font-black rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
