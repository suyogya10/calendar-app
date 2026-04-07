"use client";

import React, { useEffect } from "react";
import { format } from "date-fns";
import { X, Calendar as CalendarIcon, Clock, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, selectedDate }) => {
  // Prevent background scrolling when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[480px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h2 className="text-xl font-black text-zinc-900">New Event</h2>
              <button
                onClick={onClose}
                className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              {/* Event Title */}
              <div>
                <input
                  type="text"
                  placeholder="Event title"
                  className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-zinc-300 text-zinc-900"
                  autoFocus
                />
              </div>

              {/* Date & Time */}
              <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100/50">
                    <CalendarIcon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Date</p>
                    <p className="text-sm font-semibold text-zinc-900">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100/50">
                    <Clock className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1 flex gap-2 items-center">
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Start</p>
                      <input type="time" defaultValue="09:00" className="bg-transparent text-sm font-semibold outline-none" />
                    </div>
                    <div className="w-px h-8 bg-zinc-200"></div>
                    <div className="flex-1 pl-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">End</p>
                      <input type="time" defaultValue="10:00" className="bg-transparent text-sm font-semibold outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-4">
                 <AlignLeft className="w-5 h-5 text-zinc-400 mt-1" />
                 <textarea 
                    placeholder="Add description..." 
                    className="flex-1 bg-transparent border-none outline-none resize-none min-h-[100px] text-sm text-zinc-700 placeholder:text-zinc-400"
                 />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 border-t border-zinc-100 bg-white">
              <button 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                onClick={() => {
                  alert("Event saved successfully! (UI Only)");
                  onClose();
                }}
              >
                Save Event
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventModal;
