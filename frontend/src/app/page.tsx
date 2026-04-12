"use client";

import React, { useState, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  ShieldCheck, 
  ExternalLink, 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudLightning,
  CloudSun,
  Droplets,
  Wind,
  Clock, 
  Megaphone,
  LayoutGrid,
  Mail,
  FileText,
  UserCircle,
  LogOut,
  ChevronRight,
  Plus,
  Palmtree,
  CalendarDays,
  CheckCircle2,
  CalendarPlus
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fetchApi, BACKEND_URL } from "@/lib/api";
import AnnouncementModal from "@/components/AnnouncementModal";
import StaffLeaveModal from "@/components/StaffLeaveModal";

export default function Dashboard() {
  const { settings } = useConfig();
  const { role, user, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStaffLeaveModalOpen, setIsStaffLeaveModalOpen] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [officeApps, setOfficeApps] = useState<any[]>([]);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch announcements
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApi("/announcements");
        setAnnouncements(data?.slice(0, 3) || []); // Only show top 3
      } catch (e) {
        console.error("Failed to load announcements", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch office apps
  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await fetchApi("/office-apps");
        setOfficeApps(data || []);
      } catch (e) {
        console.error("Failed to load office apps", e);
      }
    };
    loadApps();
  }, []);
  

  // Fetch weather for Kathmandu
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto");
        const data = await res.json();
        setWeather(data.current);
      } catch (e) {
        console.error("Failed to fetch weather", e);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Update every 30 mins
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-16 h-16 text-amber-500 animate-pulse" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-16 h-16 text-amber-400 animate-pulse" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-16 h-16 text-zinc-400 animate-pulse" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-16 h-16 text-blue-500 animate-pulse" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-16 h-16 text-indigo-500 animate-pulse" />;
    if (code >= 95) return <CloudLightning className="w-16 h-16 text-yellow-500 animate-pulse" />;
    return <Sun className="w-16 h-16 text-amber-500 animate-pulse" />;
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Raining";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunderstorm";
    return "Clear Sky";
  };

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



  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 pb-12">

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8"
        >
          {/* Welcome & Clock Hero (8 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-8 space-y-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary dark:to-primary/60 rounded-[2.5rem] p-8 md:p-12 text-primary-foreground shadow-2xl shadow-primary/20">
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 text-primary-foreground">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black mb-2">Good Day, {user?.name?.split(' ')[0] || "Guest"}!</h2>
                  <p className="text-primary-foreground/80 font-bold text-lg">Your office dashboard is ready.</p>
                </div>
                
                <div className="flex flex-col items-start md:items-end">
                  <div className="flex items-center gap-3 mb-1">
                    <Clock className="w-6 h-6 opacity-80" />
                    <span className="text-3xl md:text-4xl font-black tabular-nums">
                      {format(time, "hh:mm")}
                      <span className="text-lg opacity-60 ml-1">{format(time, "a")}</span>
                    </span>
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest opacity-80">
                    {format(time, "EEEE, MMMM do")}
                  </p>
                </div>
              </div>

              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Calendar Quick Access */}
              <Link href="/calendar">
                <div className="group h-full bg-card border border-border rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-1">Office Calendar</h3>
                  <p className="text-sm font-medium text-muted-foreground">View schedules, holidays, and upcoming events.</p>
                </div>
              </Link>

              {/* Staff on Leave Card */}
              <div 
                onClick={() => setIsStaffLeaveModalOpen(true)}
                className="group h-full bg-card border border-border rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Palmtree className="w-6 h-6" />
                  </div>
                  <div className="p-2 rounded-xl bg-muted group-hover:bg-indigo-500/10 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-foreground mb-1">Staff on Leave</h3>
                <p className="text-sm font-medium text-muted-foreground">Check daily leave status or notify your own absence.</p>
              </div>

            {/* Admin Panel (Conditional) */}
            {role === "ADMIN" && (
              <Link href="/admin">
                <div className="group h-full bg-card border border-border rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-amber-500/5 hover:border-amber-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-amber-500/10 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-1">Admin Control</h3>
                  <p className="text-sm font-medium text-muted-foreground">Manage users, announcements, and global settings.</p>
                </div>
              </Link>
            )}
            </div>
            
            {/* Apps Listing */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 ml-1">Office Applications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {officeApps.map((app, i) => (
                  <a 
                    key={app.id || i} 
                    href={app.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group p-4 bg-card border border-border rounded-2xl flex flex-col items-center gap-3 hover:border-primary/50 hover:-translate-y-1 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl border border-border overflow-hidden flex items-center justify-center shrink-0 group-hover:shadow-lg transition-all ${!app.icon_url ? getAppColor(app.title) : 'bg-muted'}`}>
                       {app.icon_url ? (
                          <img 
                            src={app.icon_url.startsWith('http') ? app.icon_url : `${BACKEND_URL}${app.icon_url}`} 
                            alt={app.title} 
                            className="w-full h-full object-cover" 
                          />
                       ) : (
                          <span className="text-xl font-black text-white uppercase">{app.title.charAt(0)}</span>
                       )}
                    </div>
                    <span className="text-xs font-black text-foreground text-center line-clamp-1">{app.title}</span>
                  </a>
                ))}
                
                {officeApps.length === 0 && !loading && (
                   <div className="col-span-full py-8 text-center border-2 border-dashed border-border rounded-2xl opacity-40">
                      <p className="text-xs font-black uppercase tracking-widest">No applications added</p>
                   </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar (4 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
            {/* Weather Card */}
            <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Weather</h3>
                 <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
              
              {loadingWeather ? (
                <div className="flex items-center gap-6 animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-8 w-20 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                </div>
              ) : weather ? (
                <div className="flex items-center gap-6">
                  {getWeatherIcon(weather.weather_code)}
                  <div>
                    <div className="text-4xl font-black text-foreground">
                      {Math.round(weather.temperature_2m)}°<span className="text-xl opacity-50">C</span>
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">
                      {getWeatherDescription(weather.weather_code)} in Kathmandu
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Weather data unavailable</p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="p-3 bg-muted/30 rounded-2xl flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500/50" />
                    <div>
                      <span className="block text-[10px] font-black text-muted-foreground uppercase mb-0.5">Humidity</span>
                      <span className="text-sm font-black">{weather?.relative_humidity_2m || '--'}%</span>
                    </div>
                 </div>
                 <div className="p-3 bg-muted/30 rounded-2xl flex items-center gap-2">
                    <Wind className="w-4 h-4 text-emerald-500/50" />
                    <div>
                      <span className="block text-[10px] font-black text-muted-foreground uppercase mb-0.5">Wind</span>
                      <span className="text-sm font-black">{weather?.wind_speed_10m || '--'} <span className="text-[10px]">km/h</span></span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Announcements Card */}
            <div className="bg-card border border-border rounded-[2rem] flex flex-col overflow-hidden min-h-[400px]">
              <div className="p-6 md:p-8 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Recent Announcements</h3>
                <Megaphone className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 p-6 space-y-6">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-2">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted rounded opacity-50" />
                    </div>
                  ))
                ) : announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div 
                      key={ann.id} 
                      onClick={() => {
                        setSelectedAnnouncement(ann);
                        setIsModalOpen(true);
                      }}
                      className="group relative pl-4 border-l-4 border-primary/20 hover:border-primary transition-colors cursor-pointer"
                    >
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">{format(new Date(ann.created_at), "MMM d, yyyy")}</span>
                      <h4 className="text-sm font-black text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">{ann.title}</h4>
                      <p className="text-xs font-semibold text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <Megaphone className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-bold text-muted-foreground">No recent announcements</p>
                  </div>
                )}
              </div>
              <Link href="/announcements" className="m-4 mt-0 py-3 bg-muted/50 hover:bg-muted text-xs font-black text-center text-foreground rounded-2xl transition-colors">
                View All Announcements
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <StaffLeaveModal 
        isOpen={isStaffLeaveModalOpen}
        onClose={() => setIsStaffLeaveModalOpen(false)}
      />

      <AnnouncementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
}
