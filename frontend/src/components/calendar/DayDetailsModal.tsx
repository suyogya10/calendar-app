"use client";

import React from "react";
import { format } from "date-fns";
import { X, Clock, Plus, Flag, CalendarDays, AlignLeft, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import NepaliDate from "nepali-datetime";
import { fetchApi } from "@/lib/api";
import { ApiEvent, ApiHoliday } from "@/context/ConfigContext";

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onAddEvent: (date: Date) => void;
  onEditEvent: (date: Date, event: ApiEvent | ApiHoliday) => void;
}

// Helper to parse local API time Strings safely
function parseLocal(dtStr: string | null | undefined): Date | null {
  if (!dtStr) return null;
  const s = dtStr.replace('T', ' ').slice(0, 19);
  const [datePart, timePart = '00:00:00'] = s.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

export function DayDetailsModal({ isOpen, onClose, selectedDate, onAddEvent, onEditEvent }: DayDetailsModalProps) {
  const { apiEvents, apiHolidays, refreshApiData } = useConfig();
  const { role, user } = useAuth();
  const isAdmin = role === "ADMIN";
  const isPublic = role === "PUBLIC";

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event? This action will be logged.")) return;
    try {
      await fetchApi(`/events/${id}`, { method: "DELETE" });
      await refreshApiData();
    } catch (e: any) {
      alert(e.message || "Failed to delete event.");
    }
  };

  if (!selectedDate) return null;

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayEvents = apiEvents.filter((e) => e.start_time.startsWith(dateStr));
  const dayHolidays = apiHolidays.filter((h) => h.date === dateStr);
  const hasItems = dayEvents.length > 0 || dayHolidays.length > 0;

  // Universal Nepali date string for the header
  const nd = new NepaliDate(selectedDate);
  const nepaliDateStr = nd.format("MMMM D, YYYY");

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
            className="relative w-full max-w-md bg-background border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex flex-col p-6 border-b border-border bg-muted/20 relative shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex flex-col items-center justify-center bg-primary/10 text-primary w-16 h-16 rounded-2xl border border-primary/20">
                  <span className="text-xs font-bold uppercase">{format(selectedDate, "MMM")}</span>
                  <span className="text-2xl font-black">{format(selectedDate, "d")}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">{format(selectedDate, "EEEE")}</h2>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                  {nepaliDateStr && (
                    <p className="text-xs font-bold text-holiday mt-0.5">{nepaliDateStr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content list */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
              {!hasItems && (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-60">
                  <CalendarDays className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-bold">No events for this day</p>
                </div>
              )}

              {/* Holidays */}
              {dayHolidays.map((h) => (
                <div key={h.id} className={`flex flex-col p-4 rounded-2xl border-2 ${h.type === 'FULL' ? 'border-red-500/20 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className={`w-4 h-4 ${h.type === 'FULL' ? 'text-red-500' : 'text-green-600'}`} />
                    <h3 className={`font-black text-lg ${h.type === 'FULL' ? 'text-red-600' : 'text-green-700'}`}>{h.title}</h3>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-6">
                    {h.type === 'FULL' ? 'Full Public Holiday' : 'Half Holiday'}
                  </p>
                  {h.description && (
                    <p className="text-sm font-medium mt-2 opacity-80 ml-6">{h.description}</p>
                  )}
                </div>
              ))}

              {/* Events */}
              {dayEvents.map((e) => {
                const start = parseLocal(e.start_time);
                const end = parseLocal(e.end_time);

                return (
                  <div key={e.id} className="flex flex-col p-4 rounded-2xl border border-border bg-background shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground leading-tight">{e.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {e.is_all_day ? (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md border border-primary/20">All Day</span>
                          ) : (
                            start && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                                <Clock className="w-3 h-3" />
                                {format(start, "h:mm a")} {end && `- ${format(end, "h:mm a")}`}
                              </div>
                            )
                          )}
                          {(e as any).user && (
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">By {(e as any).user.name}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {!isPublic && (user?.id === (e as any).user_id || isAdmin) && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => onEditEvent(selectedDate, e)}
                            className="p-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-colors active:scale-90"
                            title="Edit Event"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(e.id)}
                            className="p-1.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors active:scale-90"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {e.description && (
                      <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl">
                        <AlignLeft className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                        <p>{e.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {!isPublic && (
              <div className="p-4 bg-muted/20 border-t border-border shrink-0">
                <button
                  onClick={() => {
                    onClose();
                    onAddEvent(selectedDate);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Event
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
