"use client";

import React, { useEffect, useState } from "react";
import { Bell, X, Check, Trash2, Calendar, Megaphone, Info, Loader2, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { useToast } from "@/context/ToastContext";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/notifications");
      setNotifications(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  const markRead = async (id: number) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      success("All notifications marked as read");
    } catch (e) {
      error("Failed to mark all as read");
    }
  };

  const clear = async (id: number) => {
    try {
      await fetchApi(`/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      error("Failed to delete notification");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[160] w-full max-w-sm bg-background border-l border-border shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                 <Bell className="w-5 h-5 text-primary" />
                 <h2 className="text-xl font-black text-foreground">Notifications</h2>
                 {notifications.filter(n => !n.is_read).length > 0 && (
                   <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full">
                     {notifications.filter(n => !n.is_read).length} NEW
                   </span>
                 )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                   <Loader2 className="w-8 h-8 animate-spin" />
                   <p className="text-sm font-bold uppercase tracking-widest">Loading alerts...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground opacity-50">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <BellOff className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-black uppercase tracking-widest">No notifications yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-3">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`group relative p-4 rounded-2xl border transition-all ${
                        n.is_read ? 'bg-background border-transparent opacity-60' : 'bg-primary/5 border-primary/10 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                          n.type === 'announcement' ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
                        }`}>
                           {n.type === 'announcement' ? <Megaphone className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className={`text-sm font-black leading-tight mb-1 ${n.is_read ? 'text-foreground/70' : 'text-foreground'}`}>
                             {n.title}
                           </p>
                           <p className="text-xs font-semibold text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                             {n.message}
                           </p>
                           <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                             {format(new Date(n.created_at), "MMM d, h:mm a")}
                           </span>
                        </div>
                      </div>

                      <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {!n.is_read && (
                           <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} className="p-1.5 hover:bg-green-500/10 text-green-500 rounded-lg transition-colors border border-green-500/20 bg-background shadow-sm">
                             <Check className="w-3.5 h-3.5" />
                           </button>
                         )}
                         <button onClick={(e) => { e.stopPropagation(); clear(n.id); }} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors border border-red-500/20 bg-background shadow-sm">
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/10">
                <button 
                  onClick={markAllRead}
                  className="w-full py-3 bg-muted border border-border rounded-xl font-black text-xs uppercase tracking-widest text-foreground hover:bg-background transition-all active:scale-95"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
