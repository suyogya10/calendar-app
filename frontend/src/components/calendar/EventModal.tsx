"use client";

import React, { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, Type, Tag, Save } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialTime?: string;
}

export function EventModal({ isOpen, onClose, selectedDate, initialTime }: EventModalProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(initialTime || "09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [category, setCategory] = useState("Meeting");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = () => {
    setIsSubmitting(true);
    // Mock save
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // In a real app, we would update the event context here
    }, 800);
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Admin Only</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title Input */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Display */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    Date
                  </label>
                  <div className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground font-semibold opacity-70">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Category
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  >
                    <option>Meeting</option>
                    <option>Workshop</option>
                    <option>Maintenance</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-6">
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
