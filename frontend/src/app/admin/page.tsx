"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Calendar as CalendarIcon, 
  Palmtree, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  Megaphone,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Stat {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean | null;
  icon: string;
}

interface RecentActivity {
  type: string;
  title: string;
  user: string;
  time: string;
  icon: string;
}

interface DashboardData {
  stats: Stat[];
  recent_activity: RecentActivity[];
}

const iconMap: Record<string, any> = {
  calendar: CalendarIcon,
  users: Users,
  holiday: Palmtree,
  activity: Activity,
  megaphone: Megaphone,
  user: User
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const result = await fetchApi("/admin/dashboard");
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] h-full gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>
        <p className="text-muted-foreground font-bold animate-pulse">Synchronizing metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
        <div className="bg-holiday/10 p-4 rounded-3xl mb-4">
          <AlertCircle className="w-10 h-10 text-holiday" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">Dashboard Unavailable</h2>
        <p className="text-muted-foreground mb-6 max-w-md font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const stats = data?.stats || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 font-semibold text-sm">Real-time performance metrics and recent system activity.</p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          LIVE UPDATES ENABLED
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon] || Activity;
          const colorVariants = [
            "bg-primary/10 text-primary border-primary/20",
            "bg-secondary/10 text-secondary border-secondary/20",
            "bg-holiday/10 text-holiday border-holiday/20",
            "bg-accent/10 text-accent border-accent/20"
          ];
          const colorClass = colorVariants[index % colorVariants.length];

          return (
            <div 
              key={index}
              className="bg-background rounded-2xl p-6 border border-border flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-border/80 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl border ${colorClass} transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trendUp !== null && (
                  <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded-lg ${stat.trendUp ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-holiday/10 text-holiday border border-holiday/20'}`}>
                    {stat.trendUp && <TrendingUp className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                )}
                {stat.trendUp === null && (
                  <div className="text-[10px] uppercase tracking-wider font-black text-muted-foreground bg-muted/50 border border-border/50 px-2 py-1 rounded-lg">
                     {stat.trend}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-4xl font-black text-foreground tracking-tighter tabular-nums transition-transform group-hover:translate-x-1 duration-300">
                  {stat.value}
                </h3>
                <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-background rounded-3xl border border-border shadow-sm p-6 flex flex-col min-h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Recent Activity</h2>
                <p className="text-xs font-bold text-muted-foreground mt-1">LATEST UPDATES FROM THE SYSTEM</p>
              </div>
              <button className="p-2 bg-muted/50 hover:bg-muted rounded-xl transition-colors group">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
           </div>
           
           {recentActivity.length > 0 ? (
             <div className="flex flex-col gap-3">
               {recentActivity.map((activity, idx) => {
                 const ActivityIcon = iconMap[activity.icon] || Activity;
                 return (
                   <div 
                    key={idx} 
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-default group/item"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                     <div className="p-3 rounded-xl bg-muted group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                       <ActivityIcon className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">
                         {activity.title}
                       </p>
                       <p className="text-[11px] font-bold text-muted-foreground mt-0.5 flex items-center gap-1.5">
                         <span className="text-foreground/60">{activity.user}</span>
                         <span className="w-1 h-1 bg-border rounded-full" />
                         <span>{activity.time}</span>
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/20 border border-border border-dashed rounded-3xl">
                <Activity className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No recent activity</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  System actions, event updates, and news will appear here as they occur.
                </p>
             </div>
           )}
        </div>

        {/* Quick Actions / System Info */}
        <div className="flex flex-col gap-6">

          <div className="bg-background rounded-3xl border border-border p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">System Info</h3>
              <p className="text-[10px] font-bold text-muted-foreground">VERSION & BUILD DETAILS</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Framework</span>
                <span className="text-foreground">Laravel 11.x</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Frontend</span>
                <span className="text-foreground">Next.js 14 (App)</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Database</span>
                <span className="text-foreground">MySQL 8.0</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted-foreground">Server Time</span>
                <span className="text-foreground tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
