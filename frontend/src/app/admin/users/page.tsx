"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Search, Shield, ShieldCheck, FileUp, Trash2, Edit2, X, Download, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface User {
  id: number;
  name: string;
  employee_id: string;
  email: string | null;
  department: string | null;
  is_admin: boolean;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { success, error, toast, dismiss } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    employee_id: "",
    email: "",
    department: "",
    password: "",
    is_admin: false,
  });

  const fetchUsers = useCallback(async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const res = await fetchApi(`/users?page=${page}&search=${searchQuery}`);
      // res is now a paginated object from Laravel
      setUsers(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        per_page: res.per_page
      });
    } catch (e: any) {
      console.error("Failed to fetch users", e);
      error("Unable to load users: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  // Handle Search Debounce (simple)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchUsers(newPage, search);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/users/${editingUser.id}` : "/users";
      
      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete (payload as any).password;
      }

      await fetchApi(url, {
        method,
        body: JSON.stringify(payload),
      });

      setShowUserModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers(pagination.current_page, search);
      success(editingUser ? "User updated successfully" : "User created successfully");
    } catch (e: any) {
      console.error("Failed to save user", e);
      error("Error saving user: " + e.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    const id = deleteConfirmId;
    
    // Safety check again
    if (currentUser && id === currentUser.id) {
       setDeleteConfirmId(null);
       error("Security Alert: You cannot delete your own administrative account.");
       return;
    }

    const loadingId = toast("Deleting user...", "loading");
    try {
      setLoading(true);
      setDeleteConfirmId(null);
      await fetchApi(`/users/${id}`, { method: "DELETE" });
      await fetchUsers(pagination.current_page, search);
      dismiss(loadingId);
      success("User removed successfully.");
    } catch (e: any) {
      dismiss(loadingId);
      console.error("Failed to delete user", e);
      error("Action Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    const loadingId = toast("Importing Excel file...", "loading");
    try {
      setIsImporting(true);
      await fetchApi("/users/import-excel", {
        method: "POST",
        body,
      });
      dismiss(loadingId);
      success("Staff members imported successfully.");
      setShowImportModal(false);
      fetchUsers(1, search);
    } catch (e: any) {
      dismiss(loadingId);
      console.error("Import failed", e);
      error("Import Error: " + e.message);
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      employee_id: "",
      email: "",
      department: "",
      password: "",
      is_admin: false,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">User Management</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">Manage staff by Employee ID and Departments.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-muted/80 transition-all shadow-sm"
          >
            <FileUp className="w-4 h-4" />
            Import Excel
          </button>
          <button 
            onClick={() => { resetForm(); setEditingUser(null); setShowUserModal(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-md shadow-primary/20"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, ID, email or department..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-black sticky top-0 bg-background z-10">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center font-bold text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span>Loading users...</span>
                  </div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center font-bold text-muted-foreground">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${loading ? 'opacity-50' : ''}`}>
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">{user.email || "No email"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                       <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md text-xs font-black border border-primary/10">
                        {user.employee_id}
                       </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-muted-foreground italic">
                        {user.department || "No Department"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        {user.is_admin ? (
                          <span className="flex items-center gap-1 text-primary"><ShieldCheck className="w-4 h-4" /> Admin</span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground"><Shield className="w-4 h-4" /> Staff</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({
                              name: user.name,
                              employee_id: user.employee_id,
                              email: user.email || "",
                              department: user.department || "",
                              password: "",
                              is_admin: user.is_admin
                            });
                            setShowUserModal(true);
                          }}
                          className="p-2 hover:bg-muted rounded-lg text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            if (currentUser?.id === user.id) return;
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirmId(user.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${currentUser?.id === user.id ? 'opacity-10 cursor-not-allowed text-muted-foreground' : 'hover:bg-red-500/10 text-red-500 relative z-20'}`}
                          title={currentUser?.id === user.id ? "Your Active Admin Account (Protected)" : "Delete User"}
                        >
                          <Trash2 className="w-5 h-5 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border bg-muted/5 flex items-center justify-between">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Showing <span className="text-foreground">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to <span className="text-foreground">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="text-foreground">{pagination.total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || loading}
              className="p-2 rounded-xl bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let startPage = Math.max(1, pagination.current_page - 2);
                let endPage = Math.min(pagination.last_page, startPage + maxVisible - 1);
                
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${pagination.current_page === i ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' : 'bg-background border border-border text-muted-foreground hover:bg-muted'}`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
            </div>
            <button 
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page || loading}
              className="p-2 rounded-xl bg-background border border-border text-foreground hover:bg-muted disabled:opacity-50 transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {/* User Editor Modal */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-background w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground">{editingUser ? "Edit User" : "Add New User"}</h2>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdate} className="p-6 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-[2]">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-[1]">
                    <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Emp ID</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ID"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                      className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Department</label>
                  <input 
                    type="text" 
                    value={formData.department}
                    placeholder="e.g. Cardiology, Radiology"
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                  />
                </div>

                 <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Password</label>
                  <input 
                    required={!editingUser}
                    type="password" 
                    value={formData.password}
                    placeholder={editingUser ? "Leave blank to keep current" : ""}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border mt-2 cursor-pointer" onClick={() => setFormData({...formData, is_admin: !formData.is_admin})}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_admin}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-border text-primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Grant Admin Privileges</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">Admin can manage events, holidays and users.</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2.5 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    {editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setDeleteConfirmId(null)}
               className="absolute inset-0 bg-black/70 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl p-8 flex flex-col items-center text-center relative z-10"
             >
               <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                 <AlertCircle className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-foreground mb-2">Delete User?</h3>
               <p className="text-sm font-semibold text-muted-foreground leading-relaxed mb-8">
                 Are you sure you want to remove this staff member? All their created events will be permanently deleted.
               </p>
               <div className="grid grid-cols-2 gap-3 w-full">
                 <button 
                   onClick={() => setDeleteConfirmId(null)}
                   className="px-4 py-3 bg-muted text-foreground rounded-2xl font-black text-sm hover:bg-muted/80 transition-all border border-border"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleDelete}
                   className="px-4 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-red-500/20"
                 >
                   Delete Now
                 </button>
               </div>
             </motion.div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-background w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground">Import Users</h2>
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <h3 className="text-sm font-black text-primary mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Excel Format Instructions
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                    Your Excel sheet must have a heading row with the following column names:
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {["name", "employee_id", "department", "email", "password", "is_admin"].map(col => (
                      <div key={col} className={`px-2 py-1 bg-background border border-border rounded text-[10px] font-black font-mono text-center ${col === 'name' || col === 'employee_id' ? 'border-primary/50 text-primary' : ''}`}>
                        {col}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground mt-3 italic">
                    * <span className="text-primary font-black">name</span> and <span className="text-primary font-black">employee_id</span> are mandatory.
                  </p>
                </div>

                <div className="relative group">
                  <div className={`w-full py-12 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-muted/10 transition-all ${isImporting ? 'opacity-50 cursor-wait' : 'group-hover:border-primary/50 group-hover:bg-primary/5 cursor-pointer'}`}>
                    {isImporting ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <span className="text-sm font-black text-primary">Processing Excel...</span>
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-10 h-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-black text-foreground">Click to upload Excel</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 mt-1">.xlsx, .xls, .csv</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      disabled={isImporting}
                      accept=".xlsx, .xls, .csv"
                      onChange={handleImport}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setShowImportModal(false)}
                  className="w-full px-4 py-2.5 bg-muted text-foreground border border-border rounded-xl font-bold text-sm hover:bg-muted/80 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
