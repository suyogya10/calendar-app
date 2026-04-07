"use client";

import React from "react";
import { 
  Users, 
  Calendar as CalendarIcon, 
  Palmtree, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Events (Month)",
      value: "124",
      trend: "+12%",
      trendUp: true,
      icon: CalendarIcon,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "Active Users",
      value: "42",
      trend: "+4%",
      trendUp: true,
      icon: Users,
      color: "bg-secondary/10 text-secondary border-secondary/20",
    },
    {
      label: "Upcoming Holidays",
      value: "3",
      trend: "Current Month",
      trendUp: null,
      icon: Palmtree,
      color: "bg-holiday/10 text-holiday border-holiday/20",
    },
    {
      label: "System Health",
      value: "99.9%",
      trend: "Optimized",
      trendUp: true,
      icon: Activity,
      color: "bg-accent/10 text-accent border-accent/20",
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 font-semibold text-sm">Welcome back, Admin. Here is what is happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-background rounded-2xl p-6 border border-border flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trendUp !== null && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-secondary/10 text-secondary' : 'bg-holiday/10 text-holiday'}`}>
                  {stat.trendUp && <TrendingUp className="w-3 h-3" />}
                  {stat.trend}
                </div>
              )}
              {stat.trendUp === null && (
                <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                   {stat.trend}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</h3>
              <p className="text-sm font-semibold text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Mock */}
      <div className="flex-1 bg-background rounded-2xl border border-border shadow-sm p-6 flex flex-col mt-2 min-h-[300px]">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-foreground">Recent Activity</h2>
            <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/20 border border-border border-dashed rounded-xl">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No recent activity</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Event creation and user activity will appear here once the backend is connected.
            </p>
         </div>
      </div>
    </div>
  );
}
