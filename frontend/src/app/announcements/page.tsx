"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, ChevronLeft, Calendar as CalendarIcon, Clock, AlertTriangle, ArrowLeft, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import AnnouncementModal from "@/components/AnnouncementModal";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "urgent" | "system";
  created_at: string;
  image_url?: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi("/announcements");
        setAnnouncements(data || []);
      } catch (e) {
        console.error("Failed to load announcements", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <div className="mb-12">
           <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter mb-4">What's New.</h2>
           <p className="text-muted-foreground text-lg font-semibold max-w-lg leading-relaxed">
             Stay updated with the latest organizational announcements and system updates.
           </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
             <p className="text-sm font-black uppercase tracking-widest">Fetching latest news...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-3xl p-12 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30">
                <Megaphone className="w-8 h-8" />
             </div>
             <p className="text-lg font-black text-foreground/50">No active announcements at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((ann, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={ann.id}
                onClick={() => {
                  setSelectedAnnouncement(ann);
                  setIsModalOpen(true);
                }}
                className={`group relative p-6 md:p-8 rounded-[2rem] border transition-all cursor-pointer ${
                  ann.type === 'urgent' 
                    ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' 
                    : 'bg-muted/30 border-border hover:border-primary/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    ann.type === 'urgent' 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : 'bg-primary text-primary-foreground shadow-primary/20'
                  }`}>
                    {ann.type === 'urgent' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        ann.type === 'urgent' ? 'bg-red-500/20 text-red-600' : 'bg-primary/20 text-primary'
                      }`}>
                        {ann.type} notification
                      </span>
                      <div className="flex items-center gap-1.5 text-muted-foreground opacity-60">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {format(new Date(ann.created_at), "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                      {ann.title}
                    </h3>
                    
                    <p className="text-muted-foreground font-semibold leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                      {ann.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-20 pt-10 border-t border-border flex flex-col items-center gap-6">
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50 text-center">
             Nepali Calendar Administrative Broadcasting
           </p>
           <Link href="/" className="px-8 py-3 bg-muted border border-border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-background transition-all active:scale-95">
              Back to Dashboard
           </Link>
        </div>
      </main>

      <AnnouncementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
