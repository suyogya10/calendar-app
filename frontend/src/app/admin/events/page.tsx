"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, Download, Upload, Globe, Lock, CalendarDays, Flag, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi, downloadBlob } from "@/lib/api";
import { ApiEvent, ApiHoliday } from "@/context/ConfigContext";
import { format } from "date-fns";
import { EventModal } from "@/components/calendar/EventModal";
import { useConfig } from "@/context/ConfigContext";
import { useToast } from "@/context/ToastContext";

// Parse a datetime string from the API as LOCAL time
function parseLocal(dtStr: string | null | undefined): Date | null {
  if (!dtStr) return null;
  const s = dtStr.replace('T', ' ').slice(0, 19);
  const [datePart, timePart = '00:00:00'] = s.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

type EventOrHoliday = 
  | (ApiEvent & { _type: 'EVENT' }) 
  | (ApiHoliday & { _type: 'HOLIDAY' });

export default function AdminEventsPage() {
  const { refreshApiData } = useConfig();
  const { success, error, toast, dismiss } = useToast();
  const [events, setEvents] = useState<EventOrHoliday[]>([]);
  const [filtered, setFiltered] = useState<EventOrHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventOrHoliday | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<EventOrHoliday | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsResponse, holidaysData] = await Promise.all([
        fetchApi("/events"),
        fetchApi("/holidays")
      ]);

      // Handle both plain array and {events: [...]} structure
      const eventsData = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse?.events || []);
      const normalizedEvents = eventsData.map((e: any) => ({ ...e, _type: 'EVENT' as const }));
      const normalizedHolidays = (Array.isArray(holidaysData) ? holidaysData : []).map(h => ({ ...h, _type: 'HOLIDAY' as const }));
      
      const combined = [...normalizedEvents, ...normalizedHolidays].sort((a, b) => {
        const da = a._type === 'EVENT' ? new Date(a.start_time).getTime() : new Date(a.date).getTime();
        const db = b._type === 'EVENT' ? new Date(b.start_time).getTime() : new Date(b.date).getTime();
        return da - db;
      });
      setEvents(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? events.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) : events);
  }, [search, events]);

  const openCreate = () => { setEventToEdit(null); setIsModalOpen(true); };
  const openEdit = (event: EventOrHoliday) => { setEventToEdit(event); setIsModalOpen(true); };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const item = itemToDelete;
    const uniqueId = `${item._type}-${item.id}`;
    
    setDeletingId(uniqueId);
    setItemToDelete(null);
    const loadingId = toast("Removing item...", "loading");
    
    try {
      if (item._type === 'EVENT') {
        await fetchApi(`/events/${item.id}`, { method: "DELETE" });
      } else {
        await fetchApi(`/holidays/${item.id}`, { method: "DELETE" });
      }
      dismiss(loadingId);
      success("Item removed successfully.");
      await refreshApiData();
      setEvents(prev => prev.filter(e => `${e._type}-${e.id}` !== uniqueId));
    } catch (e: any) {
      dismiss(loadingId);
      error("Failed to delete: " + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublic = async (item: EventOrHoliday) => {
    if (item._type === 'HOLIDAY') return; // Holidays are always public
    try {
      await fetchApi(`/events/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_public: !item.is_public }),
      });
      await refreshApiData();
      setEvents(prev => prev.map(e => (e._type === 'EVENT' && e.id === item.id) ? { ...e, is_public: !e.is_public } : e));
      success(item.is_public ? "Event is now private" : "Event is now public");
    } catch (e: any) {
      error("Failed to update: " + e.message);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await fetchApi("/events/export-excel");
      if (blob instanceof Blob) downloadBlob(blob, "events.xlsx");
    } catch (e: any) {
      error("Export failed: " + e.message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const loadingId = toast("Importing items...", "loading");
    try {
      await fetchApi("/events/import-excel", { method: "POST", body: form });
      dismiss(loadingId);
      success("Items imported successfully!");
      loadEvents();
      refreshApiData();
    } catch (err: any) {
      dismiss(loadingId);
      error("Import failed: " + err.message);
    }
    e.target.value = "";
  };

  const onSaved = () => { loadEvents(); };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Event Management</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            {loading ? "Loading…" : `${events.length} total item${events.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-background transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Excel
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-background transition-colors">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border bg-muted/10 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events and holidays…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-black">
                <th className="p-4">Title</th>
                <th className="p-4">Date (AD)</th>
                <th className="p-4">Date (BS)</th>
                <th className="p-4">Time / Type</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && events.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      Loading items…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? "No items match your search" : "No items yet. Create one!"}
                  </td>
                </tr>
              )}
              {!loading && filtered.map((item) => {
                const uniqueId = `${item._type}-${item.id}`;
                const start = parseLocal(item._type === 'EVENT' ? item.start_time : item.date + " 00:00:00")!;
                const end = item._type === 'EVENT' ? parseLocal(item.end_time) : null;
                const isDeleting = deletingId === uniqueId;

                return (
                  <tr key={uniqueId} className={`border-b border-border/50 transition-colors ${isDeleting ? "opacity-30" : "hover:bg-muted/10"}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item._type === 'HOLIDAY' && <Flag className={`w-4 h-4 ${item.type === 'FULL' ? 'text-red-500' : 'text-green-600'}`} />}
                        <div>
                          <p className={`font-bold ${item._type === 'HOLIDAY' ? (item.type === 'FULL' ? 'text-red-600' : 'text-green-700') : 'text-foreground'}`}>
                            {item.title}
                          </p>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">
                      {format(start, "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-sm font-semibold text-holiday whitespace-nowrap">
                      {item._type === 'EVENT' ? item.bs_start_time_nepali : item.bs_date_nepali || "—"}
                    </td>
                    <td className="p-4 text-sm font-semibold text-muted-foreground whitespace-nowrap">
                      {item._type === 'HOLIDAY'
                        ? (item.type === "FULL" ? <span className="text-red-500 font-bold">Full Holiday</span> : <span className="text-green-600 font-bold">Half Holiday</span>)
                        : (item.is_all_day ? "All Day" : (end ? `${format(start, "h:mm a")} – ${format(end, "h:mm a")}` : format(start, "h:mm a")))
                      }
                    </td>
                    <td className="p-4">
                      {item._type === 'EVENT' ? (
                        <button
                          onClick={() => handleTogglePublic(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            item.is_public ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                          }`}
                          title="Toggle visibility"
                        >
                          {item.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {item.is_public ? "Public" : "Private"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
                          <Globe className="w-3 h-3" /> Global
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(item)} 
                          disabled={isDeleting} 
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50" 
                          title="Delete"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* Delete Confirmation */}
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl p-8 flex flex-col items-center text-center relative z-10"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Delete {itemToDelete._type === 'EVENT' ? 'Event' : 'Holiday'}?</h3>
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed mb-8">
                Are you sure? This action will permanently remove <span className="text-foreground font-bold">"{itemToDelete.title}"</span>.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-3 bg-muted text-foreground rounded-2xl font-black text-sm hover:bg-muted/80 transition-all border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EventModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEventToEdit(null); }} eventToEdit={eventToEdit} onSaved={onSaved} />
    </div>
  );
}
