"use client";

import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Filter, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  X,
  Save,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { format } from "date-fns";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "urgent" | "system";
  expires_at: string | null;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { success, error, toast, dismiss } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"info" | "urgent" | "system">("info");
  const [expiresAt, setExpiresAt] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/announcements");
      setAnnouncements(data || []);
    } catch (err: any) {
      error(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setType("info");
    setExpiresAt("");
    setIsModalOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setExpiresAt(a.expires_at ? a.expires_at.slice(0, 10) : "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadId = toast(editingId ? "Updating..." : "Creating...", "loading");
    try {
      const body = { title, content, type, expires_at: expiresAt || null };
      if (editingId) {
        await fetchApi(`/announcements/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
        success("Announcement updated successfully");
      } else {
        await fetchApi("/announcements", { method: "POST", body: JSON.stringify(body) });
        success("Announcement published and notifications sent!");
      }
      setIsModalOpen(false);
      load();
    } catch (err: any) {
      error(err.message || "Failed to save");
    } finally {
      dismiss(loadId);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await fetchApi(`/announcements/${id}`, { method: "DELETE" });
      success("Deleted successfully");
      load();
    } catch (err: any) {
      error("Delete failed");
    }
  };

  const filtered = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Announcements</h1>
          <p className="text-muted-foreground font-semibold mt-1">Manage public bulletins and push notifications.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          Create Bulletin
        </button>
      </div>

      <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search bulletins..."
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-8">Type & Title</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Message Preview</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Publish Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin mb-4" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Fetching Bulletins...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No bulletins found</p>
                  </td>
                </tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-5 pl-8">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          a.type === 'urgent' ? 'bg-red-500/10 text-red-500' : 
                          a.type === 'system' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                        }`}>
                           {a.type === 'urgent' ? <AlertTriangle className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="text-sm font-black text-foreground leading-tight">{a.title}</p>
                           <span className="text-[10px] font-black uppercase opacity-60">{a.type}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-muted-foreground line-clamp-1 max-w-xs">{a.content}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{format(new Date(a.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 pr-8 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(a)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors border border-transparent hover:border-primary/20">
                           <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-500/20">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-background/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-2xl bg-background border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col"
             >
                <form onSubmit={handleSave}>
                  <div className="p-8 border-b border-border bg-muted/30">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-primary/10 text-primary rounded-xl">
                              <Megaphone className="w-6 h-6" />
                           </div>
                           <h2 className="text-2xl font-black text-foreground tracking-tight">
                              {editingId ? "Edit Bulletin" : "Compose Bulletin"}
                           </h2>
                        </div>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                           <X className="w-6 h-6" />
                        </button>
                     </div>
                     <p className="text-sm font-semibold text-muted-foreground">Broadcasting to the public dashboard and user notification center.</p>
                  </div>

                  <div className="p-8 space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Title</label>
                           <input 
                             required
                             type="text" 
                             placeholder="Bulletin Headline"
                             className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                             value={title}
                             onChange={(e) => setTitle(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Type</label>
                           <select 
                             className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground outline-none"
                             value={type}
                             onChange={(e) => setType(e.target.value as any)}
                           >
                              <option value="info">Information</option>
                              <option value="urgent">Urgent Alert</option>
                              <option value="system">System Update</option>
                           </select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Content</label>
                        <textarea 
                          required
                          placeholder="Your message here..."
                          rows={4}
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Expiry Date (Optional)</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/40 outline-none"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground px-1">Bulletin will automatically hide after this date.</p>
                     </div>
                  </div>

                  <div className="p-8 bg-muted/30 border-t border-border flex justify-end gap-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        className="flex items-center gap-2 px-10 py-3 bg-primary text-white text-sm font-black rounded-xl shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
                     >
                        <Save className="w-4 h-4" />
                        {editingId ? "Update Bulletin" : "Publish & Notify"}
                     </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
