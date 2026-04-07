"use client";

import React from "react";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";

export default function AdminEventsPage() {
  const dummyEvents = [
    { id: 1, title: "Server Maintenance", date: "2026-04-10", time: "04:00 AM", type: "System" },
    { id: 2, title: "Design Review Sync", date: "2026-04-12", time: "10:00 AM", type: "Meeting" },
    { id: 3, title: "Quarterly Planning", date: "2026-04-15", time: "09:00 AM", type: "Planning" },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Event Management</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">Manage calendar entries and appointments.</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
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
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-background transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-black">
                <th className="p-4">Event Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyEvents.map((event) => (
                <tr key={event.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors group">
                  <td className="p-4 font-bold text-foreground">{event.title}</td>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">{event.date}</td>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">{event.time}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background border border-border text-foreground">
                      {event.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
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
