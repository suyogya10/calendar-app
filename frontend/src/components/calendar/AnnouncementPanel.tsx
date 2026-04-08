"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, X, ChevronRight, AlertTriangle, Info, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "urgent" | "system";
  created_at: string;
}

export default function AnnouncementPanel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi("/announcements");
        setAnnouncements(data || []);
      } catch (e) {
        console.error("Failed to load announcements", e);
      }
    };
    load();
  }, []);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={`relative z-30 w-full overflow-hidden border-b border-border transition-colors ${
        current.type === 'urgent' ? 'bg-red-500/10' : 'bg-primary/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            current.type === 'urgent' ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/20 text-primary'
          }`}>
             {current.type === 'urgent' ? <AlertTriangle className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
          </div>
          
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                  current.type === 'urgent' ? 'bg-red-500/20 text-red-600' : 'bg-primary/20 text-primary'
                }`}>
                  {current.type}
                </span>
                <h4 className="text-sm font-black text-foreground truncate">{current.title}</h4>
             </div>
             <p className="text-xs font-semibold text-muted-foreground truncate opacity-80">{current.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {announcements.length > 1 && (
              <button 
                onClick={next}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-2 py-1 rounded-lg border border-border"
              >
                 Next ({currentIndex + 1}/{announcements.length})
                 <ChevronRight className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
               <X className="w-4 h-4" />
            </button>
        </div>
      </div>
    </motion.div>
  );
}
