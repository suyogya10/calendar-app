"use client";

import React from "react";
import { X, Calendar, Clock, Megaphone, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "urgent" | "system";
  created_at: string;
  image_url?: string;
}

interface AnnouncementModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnnouncementModal({ announcement, isOpen, onClose }: AnnouncementModalProps) {
  if (!announcement) return null;

  // Simple function to detect and wrap links in anchor tags if they aren't already
  const renderContent = (content: string) => {
    // This is a basic implementation. For production, a markdown renderer would be better.
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline inline-flex items-center gap-1 font-bold"
          >
            {part}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header / Banner */}
            <div className={`h-32 shrink-0 flex items-center justify-center relative overflow-hidden ${
              announcement.type === 'urgent' ? 'bg-red-500/10' : 'bg-primary/10'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                announcement.type === 'urgent' ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
              }`}>
                {announcement.type === 'urgent' ? <AlertTriangle className="w-8 h-8" /> : <Megaphone className="w-8 h-8" />}
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-background/50 hover:bg-background border border-border transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                  announcement.type === 'urgent' ? 'bg-red-500/20 text-red-600' : 'bg-primary/20 text-primary'
                }`}>
                  {announcement.type} notification
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground opacity-60">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {format(new Date(announcement.created_at), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6 leading-tight">
                {announcement.title}
              </h2>

              {announcement.image_url && (
                <div className="mb-8 rounded-3xl overflow-hidden border border-border shadow-lg">
                  <img 
                    src={announcement.image_url} 
                    alt={announcement.title} 
                    className="w-full h-auto object-cover max-h-80"
                  />
                </div>
              )}

              <div className="text-muted-foreground font-semibold leading-relaxed text-base md:text-lg whitespace-pre-wrap space-y-4">
                {renderContent(announcement.content)}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:px-10 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase opacity-50">
                  <Info className="w-4 h-4" />
                  Broadcasted by Office Admin
               </div>
               <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-foreground text-background font-black text-xs rounded-xl hover:opacity-90 transition-opacity"
               >
                 Close
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
