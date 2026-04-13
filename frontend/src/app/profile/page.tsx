"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, BACKEND_URL } from "@/lib/api";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  UserCircle,
} from "lucide-react";

// ─── Client-side Image Compression ─────────────────────────────────────────
async function compressImage(file: File, maxSize = 400, quality = 0.72): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;

      let targetW = w;
      let targetH = h;
      if (w > h) {
        targetW = Math.min(w, maxSize);
        targetH = Math.round(h * (targetW / w));
      } else {
        targetH = Math.min(h, maxSize);
        targetW = Math.round(w * (targetH / h));
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── Toast Component ────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold ${
        type === "success"
          ? "bg-emerald-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState<"info" | "security">("info");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Personal Info State ────────────────────────────────────────────────
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [savingInfo, setSavingInfo] = useState(false);

  // ── Avatar State ───────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar_url ? (user.avatar_url.startsWith("http") ? user.avatar_url : `${BACKEND_URL}${user.avatar_url}`) : null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Password State ─────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Keep fields in sync if user changes
  useEffect(() => {
    setEmail(user?.email ?? "");
    setPhone(user?.phone_number ?? "");
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url.startsWith("http") ? user.avatar_url : `${BACKEND_URL}${user.avatar_url}`);
    }
  }, [user]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview original
    setAvatarPreview(URL.createObjectURL(file));
    // Compress on client side
    try {
      const compressed = await compressImage(file);
      setAvatarFile(compressed);
    } catch {
      setAvatarFile(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("avatar", avatarFile);
      const updated = await fetchApi("/profile", { method: "POST", body: form });
      setUser?.(updated);
      setAvatarFile(null);
      showToast("Profile picture updated!", "success");
    } catch (e: any) {
      showToast(e.message || "Failed to upload avatar.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const updated = await fetchApi("/profile/avatar", { method: "DELETE" });
      setUser?.(updated);
      setAvatarPreview(null);
      setAvatarFile(null);
      showToast("Profile picture removed.", "success");
    } catch (e: any) {
      showToast(e.message || "Failed to remove avatar.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const form = new FormData();
      form.append("email", email);
      form.append("phone_number", phone);
      const updated = await fetchApi("/profile", { method: "POST", body: form });
      setUser?.(updated);
      showToast("Profile updated successfully!", "success");
    } catch (e: any) {
      showToast(e.message || "Failed to update profile.", "error");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await fetchApi("/profile/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully!", "success");
    } catch (e: any) {
      showToast(e.message || "Failed to change password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Password strength helper ───────────────────────────────────────────
  const passwordStrength = (pw: string) => {
    if (!pw) return { label: "", color: "" };
    if (pw.length < 6) return { label: "Too short", color: "bg-red-500" };
    if (pw.length < 8) return { label: "Weak", color: "bg-orange-500" };
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    if (hasLetter && hasNum && hasSpecial) return { label: "Strong", color: "bg-emerald-500" };
    if (hasLetter && hasNum) return { label: "Good", color: "bg-blue-500" };
    return { label: "Fair", color: "bg-yellow-500" };
  };
  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-2xl mx-auto px-4 pt-8 md:pt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Avatar Card ─────────────────────────────────────────── */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-[2.5rem] p-8 mb-8 text-primary-foreground overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/3" />
            <div className="relative z-10 flex items-center gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-primary-foreground/20 flex items-center justify-center ring-4 ring-white/30">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-14 h-14 text-primary-foreground/60" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  title="Change picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
              </div>

              {/* Name / ID */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black truncate">{user?.name || "Employee"}</h2>
                <p className="text-sm font-bold opacity-70 mt-0.5">ID: {user?.employee_id}</p>
                {user?.is_admin && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>

            {/* Avatar action buttons */}
            {(avatarFile || avatarPreview) && (
              <div className="relative z-10 flex gap-3 mt-5">
                {avatarFile && (
                  <button
                    onClick={handleSaveAvatar}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary text-xs font-black rounded-xl hover:bg-white/90 transition-all disabled:opacity-60"
                  >
                    {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Save Photo
                  </button>
                )}
                {avatarPreview && !avatarFile && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-white text-xs font-black rounded-xl hover:bg-red-500/40 transition-all disabled:opacity-60"
                  >
                    {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Tabs ────────────────────────────────────────────────── */}
          <div className="flex gap-1 p-1 bg-muted rounded-2xl mb-6">
            {(["info", "security"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${
                  tab === t
                    ? "bg-card shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "info" ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {t === "info" ? "Personal Info" : "Security"}
              </button>
            ))}
          </div>

          {/* ── Personal Info Tab ───────────────────────────────────── */}
          {tab === "info" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-5"
            >
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Account Info</h3>

              {/* Read-only: Name */}
              <div>
                <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl border border-border cursor-not-allowed opacity-60">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold">{user?.name}</span>
                  <span className="ml-auto text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Admin only</span>
                </div>
              </div>

              {/* Read-only: Employee ID */}
              <div>
                <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">Employee ID</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl border border-border cursor-not-allowed opacity-60">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold">{user?.employee_id}</span>
                  <span className="ml-auto text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Admin only</span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact Info</h3>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border focus-within:border-primary transition-colors">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border focus-within:border-primary transition-colors">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveInfo}
                  disabled={savingInfo}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Security Tab ────────────────────────────────────────── */}
          {tab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-5"
            >
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Change Password</h3>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">Current Password</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border focus-within:border-primary transition-colors">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/50"
                  />
                  <button onClick={() => setShowCurrent(!showCurrent)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">New Password</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border focus-within:border-primary transition-colors">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/50"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength meter */}
                {newPassword && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${strength.color}`}
                        style={{
                          width:
                            strength.label === "Too short" ? "15%" :
                            strength.label === "Weak" ? "30%" :
                            strength.label === "Fair" ? "55%" :
                            strength.label === "Good" ? "75%" : "100%"
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground">{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-black text-muted-foreground mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className={`flex items-center gap-3 px-4 py-3 bg-background rounded-xl border transition-colors focus-within:border-primary ${
                  confirmPassword && confirmPassword !== newPassword ? "border-red-500" : "border-border"
                }`}>
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground/50"
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 ml-1">Passwords do not match</p>
                )}
              </div>

              <button
                onClick={handleSavePassword}
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
