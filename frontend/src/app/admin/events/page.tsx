"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Trash } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { ApiEvent } from "@/context/ConfigContext";
import { format } from "date-fns";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await fetchApi("/events");
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetchApi(`/events/${id}`, { method: "DELETE" });
      setEvents(events.filter(e => e.id !== id));
    } catch (e: any) {
      alert("Failed to delete event: " + e.message);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Event Management</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">Manage calendar entries and appointments.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const a = document.createElement("a");
              a.href = "http://127.0.0.1:8000/api/events/export-excel"; // For direct download assuming user respects cookie/auth, but typically needs fetch blob, I'll redirect them.
              a.download = "events.xlsx";
              // But since we use Bearer token, we need to fetch blob natively:
              fetchApi("/events/export-excel").then(blob => {
                 if (blob instanceof Blob) {
                   const url = window.URL.createObjectURL(blob);
                   const link = document.createElement('a');
                   link.href = url;
                   link.setAttribute('download', 'events.xlsx');
                   document.body.appendChild(link);
                   link.click();
                   link.remove();
                 }
              }).catch(console.error);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-secondary/20"
          >
            Export Excel
          </button>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-black">
                <th className="p-4">Event Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : events.map((event) => (
                <tr key={event.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors group">
                  <td className="p-4 font-bold text-foreground">{event.title}</td>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">
                    {format(new Date(event.start_time), "yyyy-MM-dd")}<br/>
                    <span className="text-xs text-holiday">{event.bs_start_time_nepali}</span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">
                    {event.is_all_day ? "All Day" : format(new Date(event.start_time), "hh:mm a")}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${event.is_public ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                      {event.is_public ? "Public" : "Private"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
