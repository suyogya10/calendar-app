"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Palmtree, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  CalendarPlus,
  CheckCircle2,
  Users,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays } from "date-fns";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface StaffLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffLeaveModal({ isOpen, onClose }: StaffLeaveModalProps) {
  const { user } = useAuth();
  const [leaveDate, setLeaveDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [staffLeave, setStaffLeave] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestDate, setRequestDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedUserId, setSelectedUserId] = useState<string | number>("");
  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadStaffLeave = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/staff-holidays?date=${leaveDate}`);
        setStaffLeave(data || []);
      } catch (e) {
        console.error("Failed to load staff leave", e);
      } finally {
        setLoading(false);
      }
    };
    loadStaffLeave();
  }, [leaveDate, isOpen]);

  useEffect(() => {
    if (isOpen && user?.is_admin) {
      fetchApi("/users?all=1").then(data => {
        setUsers(Array.isArray(data) ? data : (data?.data || []));
      });
    }
  }, [isOpen, user]);

  const handleNotifyLeave = async () => {
    setSubmitting(true);
    try {
      const payload: any = { date: requestDate };
      if (user?.is_admin && selectedUserId) {
        payload.user_id = selectedUserId;
      }

      await fetchApi("/staff-holidays", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSuccess(true);
      if (requestDate === leaveDate) {
        const data = await fetchApi(`/staff-holidays?date=${leaveDate}`);
        setStaffLeave(data || []);
      }
      setTimeout(() => {
        setSuccess(false);
        setIsRequesting(false);
        setSelectedUserId("");
      }, 2000);
    } catch (e: any) {
      alert(e.message || "Failed to notify leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id: number) => {
    if (!confirm("Are you sure you want to delete this leave notification? This will be logged.")) return;
    try {
      await fetchApi(`/staff-holidays/${id}`, { method: "DELETE" });
      const data = await fetchApi(`/staff-holidays?date=${leaveDate}`);
      setStaffLeave(data || []);
    } catch (e: any) {
      alert(e.message || "Failed to delete leave notification");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                <Palmtree className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Staff on Leave</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Daily Attendance Overview</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isRequesting ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Date Controls */}
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-2xl">
                  <button 
                    onClick={() => setLeaveDate(format(subDays(new Date(leaveDate), 1), "yyyy-MM-dd"))}
                    className="p-2 hover:bg-background rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-sm font-black text-foreground">
                    {format(new Date(leaveDate), "MMMM do, yyyy")}
                  </div>
                  <button 
                    onClick={() => setLeaveDate(format(addDays(new Date(leaveDate), 1), "yyyy-MM-dd"))}
                    className="p-2 hover:bg-background rounded-xl transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Staff List */}
                <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-3 w-20 bg-muted rounded opacity-50" />
                        </div>
                      </div>
                    ))
                  ) : staffLeave.length > 0 ? (
                    staffLeave.map((sh, idx) => (
                      <div key={idx} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm font-black group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          {sh.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-foreground">{sh.user.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{sh.user.department || "General"}</p>
                        </div>
                        {(user?.is_admin || sh.user_id === user?.id) && (
                          <button 
                            onClick={() => handleDeleteLeave(sh.id)}
                            className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl transition-all active:scale-90"
                            title="Delete Leave Notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                      <Users className="w-12 h-12 mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No staff on leave</p>
                    </div>
                  )}
                </div>

                {user && (user.is_admin || user.department === "Medical Professionals and Allied Healthcare Providers") && (
                  <button 
                    onClick={() => setIsRequesting(true)}
                    className="w-full bg-primary text-primary-foreground p-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                  >
                    <CalendarPlus className="w-5 h-5" />
                    Notify about my Leave
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="request"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-4">
                  {user?.is_admin && (
                    <div>
                      <h3 className="text-xs font-black text-primary uppercase tracking-wider mb-2">Notify For User</h3>
                      <select 
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="">Myself ({user.name})</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-wider mb-2">Select Leave Date</h3>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={requestDate}
                        onChange={(e) => setRequestDate(e.target.value)}
                        onClick={(e) => (e.currentTarget as any).showPicker?.()}
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                      />
                      <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                    This will be visible on the public dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsRequesting(false)}
                    className="p-5 bg-muted text-foreground rounded-2xl font-black text-sm hover:bg-muted/80 transition-all font-black uppercase"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleNotifyLeave}
                    disabled={submitting || success}
                    className="p-5 bg-indigo-500 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 font-black uppercase"
                  >
                    {submitting ? (
                      <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />
                    ) : success ? (
                      <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />
                    ) : (
                      "Confirm Leave"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
