"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Save, 
  X, 
  Loader2, 
  ExternalLink,
  LayoutGrid,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi, BACKEND_URL } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface OfficeApp {
  id: number;
  title: string;
  url: string;
  icon_url: string | null;
  sort_order: number;
}

export default function AdminOfficeAppsPage() {
  const [apps, setApps] = useState<OfficeApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { success, error, toast, dismiss } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const getAppColor = (title: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", 
      "bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500"
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/office-apps");
      setApps(data || []);
    } catch (err: any) {
      error(err.message || "Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setSortOrder(0);
    setIconFile(null);
    setIconPreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (app: OfficeApp) => {
    setEditingId(app.id);
    setTitle(app.title);
    setUrl(app.url);
    setSortOrder(app.sort_order);
    setIconFile(null);
    setIconPreview(app.icon_url ? (app.icon_url.startsWith('http') ? app.icon_url : `${BACKEND_URL}${app.icon_url}`) : null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadId = toast(editingId ? "Updating..." : "Creating...", "loading");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("url", url);
      formData.append("sort_order", sortOrder.toString());
      if (iconFile) {
        formData.append("icon", iconFile);
      }

      if (editingId) {
        // Laravel has trouble with PUT/PATCH and multipart/form-data.
        // We use POST with _method spoofing if needed, but here I'll try POST to the update route if handled,
        // or just use POST and handle nicely in controller.
        // Actually, my controller update method expects $id.
        
        // Use POST with _method=PUT for multipart updates in Laravel
        formData.append("_method", "PUT");
        await fetchApi(`/office-apps/${editingId}`, { 
          method: "POST", 
          body: formData 
        });
        success("App updated successfully");
      } else {
        await fetchApi("/office-apps", { method: "POST", body: formData });
        success("App created successfully");
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
      await fetchApi(`/office-apps/${id}`, { method: "DELETE" });
      success("Deleted successfully");
      load();
    } catch (err: any) {
      error("Delete failed");
    }
  };

  const filtered = apps.filter(app => 
    app.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Office Applications</h1>
          <p className="text-muted-foreground font-semibold mt-1">Manage external links and application icons on the dashboard.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          Add Application
        </button>
      </div>

      <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search applications..."
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
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-8">Icon & Title</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Link URL</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Order</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin mb-4" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Fetching Apps...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No applications found</p>
                  </td>
                </tr>
              ) : filtered.map((app) => (
                <tr key={app.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-5 pl-8">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl border border-border overflow-hidden flex items-center justify-center shrink-0 ${!app.icon_url ? getAppColor(app.title) : 'bg-muted'}`}>
                           {app.icon_url ? (
                              <img 
                                src={app.icon_url.startsWith('http') ? app.icon_url : `${BACKEND_URL}${app.icon_url}`} 
                                alt={app.title} 
                                className="w-full h-full object-cover" 
                              />
                           ) : (
                              <span className="text-sm font-black text-white uppercase">{app.title.charAt(0)}</span>
                           )}
                        </div>
                        <p className="text-sm font-black text-foreground leading-tight">{app.title}</p>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground line-clamp-1 max-w-xs">{app.url}</code>
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:scale-110 transition-transform">
                           <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-muted-foreground">{app.sort_order}</span>
                  </td>
                  <td className="px-6 py-5 pr-8 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(app)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors">
                           <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(app.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
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
               className="relative w-full max-w-xl bg-background border border-border shadow-2xl rounded-3xl overflow-hidden"
             >
                <form onSubmit={handleSave}>
                  <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-primary/10 text-primary rounded-xl">
                          <LayoutGrid className="w-6 h-6" />
                       </div>
                       <h2 className="text-2xl font-black text-foreground tracking-tight">
                          {editingId ? "Edit Application" : "New Application"}
                       </h2>
                    </div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                       <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="flex justify-center flex-col items-center gap-4">
                       <div className={`relative w-24 h-24 rounded-3xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors ${!iconPreview ? (title ? getAppColor(title) : 'bg-muted') : ''}`}>
                          {iconPreview ? (
                             <img src={iconPreview} className="w-full h-full object-cover" />
                          ) : (
                             title ? <span className="text-3xl font-black text-white uppercase">{title.charAt(0)}</span> : <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                             <Plus className="w-8 h-8 text-white" />
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                       </div>
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Icon Image (Square Recommended)</p>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Application Title</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. HR Portal"
                            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Link URL</label>
                          <input 
                            required
                            type="url" 
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Sort Order</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(parseInt(e.target.value))}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="p-8 bg-muted/30 border-t border-border flex justify-end gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-muted-foreground">Cancel</button>
                     <button type="submit" className="flex items-center gap-2 px-10 py-3 bg-primary text-white text-sm font-black rounded-xl shadow-xl shadow-primary/30">
                        <Save className="w-4 h-4" />
                        Save Application
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
