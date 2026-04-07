"use client";

import React from "react";
import { UserPlus, Search, Shield, ShieldCheck } from "lucide-react";

export default function AdminUsersPage() {
  const dummyUsers = [
    { id: 1, name: "Sujan Admin", email: "sujan@example.com", role: "ADMIN", status: "Active" },
    { id: 2, name: "Staff Member A", email: "staff1@example.com", role: "EDITOR", status: "Active" },
    { id: 3, name: "Staff Member B", email: "staff2@example.com", role: "VIEWER", status: "Inactive" },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">User Management</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">Manage staff access and roles.</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-primary/20">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-black">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-bold text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-semibold text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      {user.role === "ADMIN" ? <ShieldCheck className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                      {user.role}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.status === "Active" 
                        ? "bg-secondary/10 text-secondary border-secondary/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
