"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  BedDouble,
  CreditCard,
  AlertOctagon,
  FileText,
  Menu,
  X,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Building,
  Calendar,
  Lock,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type TabType = "dashboard" | "pgs" | "users" | "tenants" | "rooms" | "payments" | "complaints" | "logs";

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Global platform state
  const [pgs, setPgs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    totalPgs: 0,
    activePgs: 0,
    totalUsers: 0,
    activeTenants: 0,
    totalRevenue: 0,
    pendingComplaints: 0
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Add Form Modals
  const [modalType, setModalType] = useState<"add_pg" | "edit_pg" | "edit_user" | "add_room" | "add_tenant" | "collect_rent" | "assign_staff" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form Fields
  // PG Form
  const [pgName, setPgName] = useState("");
  const [pgAddress, setPgAddress] = useState("");
  const [pgPhone, setPgPhone] = useState("");
  const [pgOwnerId, setPgOwnerId] = useState("");
  const [pgPlan, setPgPlan] = useState("free");
  // User Form
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userRole, setUserRole] = useState("Tenant");
  const [userPgId, setUserPgId] = useState("");
  // Room Form
  const [roomNumber, setRoomNumber] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("2");
  const [roomRent, setRoomRent] = useState("");
  const [roomPgId, setRoomPgId] = useState("");
  // Tenant Form
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantPgId, setTenantPgId] = useState("");
  const [tenantRoomId, setTenantRoomId] = useState("");
  const [tenantDeposit, setTenantDeposit] = useState("");
  // Rent Form
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  // Complaint Assignment Form
  const [complaintStaffId, setComplaintStaffId] = useState("");

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch pgs
      const { data: pgsList } = await supabase
        .from("pgs")
        .select("*, users!pgs_owner_id_fkey(name, email)");
      setPgs(pgsList || []);

      // 2. Fetch users
      const { data: usersList } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });
      setUsers(usersList || []);

      // 3. Fetch tenants
      const { data: tenantsList } = await supabase
        .from("tenants")
        .select("*, pgs(name), rooms(room_number)")
        .is("deleted_at", null);
      setTenants(tenantsList || []);

      // 4. Fetch rooms
      const { data: roomsList } = await supabase
        .from("rooms")
        .select("*, pgs(name), beds(*)")
        .is("deleted_at", null);
      setRooms(roomsList || []);

      // 5. Fetch payments
      const { data: paymentsList } = await supabase
        .from("payments")
        .select("*, pgs(name), tenants(*, users(name))")
        .is("deleted_at", null);
      setPayments(paymentsList || []);

      // 6. Fetch complaints
      const { data: complaintsList } = await supabase
        .from("complaints")
        .select("*, pgs(name), tenants(*, users(name))")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      setComplaints(complaintsList || []);

      // 7. Fetch audit logs
      const { data: auditList } = await supabase
        .from("audit_logs")
        .select("*, users(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      setAuditLogs(auditList || []);

      // 8. Fetch staff
      const { data: staffList } = await supabase
        .from("users")
        .select("*")
        .eq("role", "Staff");
      setStaffList(staffList || []);

      // Compute statistics
      const totalRevenue = (paymentsList || [])
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      const pendingComplaints = (complaintsList || [])
        .filter((c: any) => c.status === "pending" || c.status === "in_progress")
        .length;

      setStats({
        totalPgs: pgsList?.length || 0,
        activePgs: pgsList?.filter((p: any) => p.is_active !== false).length || 0,
        totalUsers: usersList?.length || 0,
        activeTenants: tenantsList?.filter((t: any) => t.status === "active").length || 0,
        totalRevenue,
        pendingComplaints
      });
    } catch (err: any) {
      console.error("Refresh data error:", err);
      setToastMessage("Data load failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAdmin = async () => {
    setIsVerifying(true);
    setAuthError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoggedIn(false);
        setIsAuthorized(false);
        return;
      }

      setIsLoggedIn(true);
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.role === "Super Admin") {
        setIsAuthorized(true);
        setCurrentUser(profile);
        await refreshAllData();
      } else {
        setIsAuthorized(false);
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setAuthError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyAdmin();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "Super Admin") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Only Super Administrators are permitted.");
      }

      setIsLoggedIn(true);
      setIsAuthorized(true);
      setCurrentUser(profile);
      setToastMessage("Super Admin login successful!");
      await refreshAllData();
    } catch (err: any) {
      console.error("Login failed:", err);
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setIsAuthorized(false);
      setCurrentUser(null);
      setToastMessage("Logged out successfully.");
    } catch (err: any) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logAction = async (action: string, details: string) => {
    try {
      if (!currentUser?.id) return;
      await supabase.from("audit_logs").insert({
        user_id: currentUser.id,
        action,
        details
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

  // Actions
  // Toggle PG status
  const handleTogglePg = async (pgId: number, currentActive: boolean) => {
    const action = currentActive ? "suspend" : "activate";
    if (!confirm(`Are you sure you want to ${action} this PG property?`)) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("pgs")
        .update({ is_active: !currentActive })
        .eq("id", pgId);

      if (error) throw error;
      setToastMessage(`PG Business ${action}ed successfully!`);
      await logAction(`${action.toUpperCase()}_PG`, `Property ID: ${pgId}`);
      await refreshAllData();
    } catch (err: any) {
      setToastMessage("Action failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create PG
  const handleCreatePgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgName || !pgAddress || !pgPhone || !pgOwnerId) {
      alert("All fields are required.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("pgs")
        .insert({
          name: pgName,
          address: pgAddress,
          phone: pgPhone,
          owner_id: pgOwnerId,
          subscription_plan: pgPlan,
          is_active: true
        });

      if (error) throw error;
      setToastMessage(`PG "${pgName}" registered successfully!`);
      await logAction("CREATE_PG", `Name: ${pgName}, Owner ID: ${pgOwnerId}`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit PG Details
  const handleEditPgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgName || !pgAddress || !pgPhone || !pgOwnerId) {
      alert("All fields are required.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("pgs")
        .update({
          name: pgName,
          address: pgAddress,
          phone: pgPhone,
          owner_id: pgOwnerId,
          subscription_plan: pgPlan
        })
        .eq("id", selectedItem.id);

      if (error) throw error;
      setToastMessage(`PG "${pgName}" updated successfully!`);
      await logAction("UPDATE_PG", `ID: ${selectedItem.id}, Name: ${pgName}`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update User Details / Role
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) {
      alert("Name and Phone are required.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Update users profile
      const { error } = await supabase
        .from("users")
        .update({
          name: userName,
          phone: userPhone,
          role: userRole,
          pg_id: userPgId ? Number(userPgId) : null
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      // 2. If user is Owner / Staff and pg_id is set, sync members table
      if (["Owner", "Manager", "Staff"].includes(userRole) && userPgId) {
        await supabase
          .from("pg_members")
          .upsert({
            pg_id: Number(userPgId),
            user_id: selectedItem.id,
            role: userRole
          });
      }

      setToastMessage("User profile updated successfully!");
      await logAction("UPDATE_USER", `ID: ${selectedItem.id}, Role: ${userRole}`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Onboard Tenant
  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantEmail || !tenantPhone || !tenantPgId || !tenantRoomId || !tenantDeposit) {
      alert("All fields are required.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Check bed availability
      const { data: roomDetails } = await supabase
        .from("rooms")
        .select("*, beds(*)")
        .eq("id", Number(tenantRoomId))
        .single();

      if (!roomDetails) throw new Error("Selected room not found.");

      const availableBed = (roomDetails.beds || []).find((b: any) => b.status === "available");
      if (!availableBed) throw new Error("This room is already at full capacity.");

      const inviteToken = "ADMIN-INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // 2. Create tenant profile
      const { data: newTenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          pg_id: Number(tenantPgId),
          name: tenantName,
          email: tenantEmail,
          phone: tenantPhone,
          room_id: Number(tenantRoomId),
          bed_id: availableBed.id,
          deposit: Number(tenantDeposit),
          status: "active",
          invite_token: inviteToken,
          invite_expires_at: expiryDate.toISOString()
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 3. Mark bed as occupied
      await supabase
        .from("beds")
        .update({ status: "occupied" })
        .eq("id", availableBed.id);

      // 4. Create invoice
      await supabase.from("payments").insert({
        tenant_id: newTenant.id,
        pg_id: Number(tenantPgId),
        amount: Number(roomDetails.rent || 5000),
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        status: "pending",
        due_date: new Date().toISOString().split("T")[0]
      });

      setToastMessage("Tenant onboarding complete! Token generated.");
      await logAction("ONBOARD_TENANT", `Name: ${tenantName}, Token: ${inviteToken}`);
      alert(`Tenant boarded! Invite Token:\n\nToken: ${inviteToken}\nExpires: 7 days`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Evict Tenant
  const handleEvictTenant = async (tenant: any) => {
    if (!confirm(`Are you sure you want to evict/remove tenant "${tenant.name}"? This deallocates their bed and voids active logs.`)) return;
    setIsLoading(true);
    try {
      // 1. Mark bed as available
      if (tenant.bed_id) {
        await supabase
          .from("beds")
          .update({ status: "available" })
          .eq("id", tenant.bed_id);
      }

      // 2. Soft delete tenant record (mark as left)
      const { error } = await supabase
        .from("tenants")
        .update({
          status: "left",
          deleted_at: new Date().toISOString()
        })
        .eq("id", tenant.id);

      if (error) throw error;
      setToastMessage(`Tenant "${tenant.name}" evicted successfully.`);
      await logAction("EVICT_TENANT", `Tenant ID: ${tenant.id}`);
      await refreshAllData();
    } catch (err: any) {
      setToastMessage("Eviction failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Room
  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !roomFloor || !roomCapacity || !roomRent || !roomPgId) {
      alert("All fields are required.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Insert room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({
          pg_id: Number(roomPgId),
          room_number: roomNumber,
          floor: Number(roomFloor),
          capacity: Number(roomCapacity),
          rent: Number(roomRent),
          status: "available"
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // 2. Insert beds
      for (let i = 1; i <= Number(roomCapacity); i++) {
        await supabase.from("beds").insert({
          room_id: room.id,
          bed_number: `Bed ${i}`,
          status: "available"
        });
      }

      setToastMessage(`Room ${roomNumber} created with ${roomCapacity} beds.`);
      await logAction("CREATE_ROOM", `PG ID: ${roomPgId}, Number: ${roomNumber}`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Collect Rent Override
  const handleCollectRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || !paymentRef) {
      alert("Amount and Transaction Reference are required.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "paid",
          amount: Number(paymentAmount),
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: paymentMethod,
          reference_code: paymentRef
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      // Log transaction ledger entry
      await supabase.from("payment_transactions").insert({
        payment_id: selectedItem.id,
        pg_id: selectedItem.pg_id,
        amount: Number(paymentAmount),
        transaction_type: "credit",
        status: "success",
        reference_number: paymentRef
      });

      setToastMessage("Payment logged successfully!");
      await logAction("COLLECT_RENT_OVERRIDE", `Payment ID: ${selectedItem.id}`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Complaint Status
  const handleUpdateComplaintStatus = async (complaintId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "in_progress" : currentStatus === "in_progress" ? "resolved" : "pending";
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: nextStatus })
        .eq("id", complaintId);

      if (error) throw error;
      setToastMessage(`Complaint status set to ${nextStatus}!`);
      await logAction("UPDATE_COMPLAINT_STATUS", `Complaint ID: ${complaintId}, Status: ${nextStatus}`);
      await refreshAllData();
    } catch (err: any) {
      setToastMessage("Update failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Assign Support Staff
  const handleAssignStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintStaffId) {
      alert("Please select a staff member.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ assigned_to: complaintStaffId })
        .eq("id", selectedItem.id);

      if (error) throw error;
      setToastMessage("Support staff assigned successfully!");
      await logAction("ASSIGN_STAFF_COMPLAINT", `Complaint ID: ${selectedItem.id}, Staff: ${complaintStaffId}`);
      setModalType(null);
      await refreshAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter lists based on search query
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case "pgs":
        return pgs.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.users?.name?.toLowerCase().includes(query)
        );
      case "users":
        return users.filter(u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query)
        );
      case "tenants":
        return tenants.filter(t =>
          t.name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.phone?.toLowerCase().includes(query) ||
          t.pgs?.name?.toLowerCase().includes(query)
        );
      case "rooms":
        return rooms.filter(r =>
          r.room_number.toLowerCase().includes(query) ||
          r.pgs?.name?.toLowerCase().includes(query)
        );
      case "payments":
        return payments.filter(p =>
          (p.tenants?.users?.name || p.tenants?.name)?.toLowerCase().includes(query) ||
          p.pgs?.name?.toLowerCase().includes(query) ||
          p.status.toLowerCase().includes(query)
        );
      case "complaints":
        return complaints.filter(c =>
          c.title.toLowerCase().includes(query) ||
          (c.tenants?.users?.name || c.tenants?.name)?.toLowerCase().includes(query) ||
          c.pgs?.name?.toLowerCase().includes(query)
        );
      case "logs":
        return auditLogs.filter(l =>
          l.action.toLowerCase().includes(query) ||
          l.details.toLowerCase().includes(query) ||
          l.users?.name?.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const filteredItems = getFilteredItems();

  if (isVerifying) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAuthorized) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 bg-slate-950 text-white min-h-screen relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-8 select-none">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/5 overflow-hidden">
              <img src="/logo.png" alt="PG Admin Logo" className="w-12 h-12 rounded-xl object-cover" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">PG Admin Console</h2>
            <p className="text-xs font-bold text-slate-400 mt-2">
              Platform administration portal. Access restricted to authorized Super Admins.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4.5">
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-[11px] font-bold text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pgdesk.com"
                className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold px-4 h-12 rounded-xl focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold px-4 h-12 rounded-xl focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-12 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Access</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery("");
    setIsDrawerOpen(false);
  };

  const openAddPgModal = () => {
    setPgName("");
    setPgAddress("");
    setPgPhone("");
    setPgOwnerId("");
    setPgPlan("free");
    setSelectedItem(null);
    setModalType("add_pg");
  };

  const openEditPgModal = (pg: any) => {
    setSelectedItem(pg);
    setPgName(pg.name);
    setPgAddress(pg.address);
    setPgPhone(pg.phone);
    setPgOwnerId(pg.owner_id);
    setPgPlan(pg.subscription_plan || "free");
    setModalType("edit_pg");
  };

  const openEditUserModal = (userItem: any) => {
    setSelectedItem(userItem);
    setUserName(userItem.name);
    setUserPhone(userItem.phone || "");
    setUserRole(userItem.role);
    setUserPgId(userItem.pg_id ? String(userItem.pg_id) : "");
    setModalType("edit_user");
  };

  const openAddRoomModal = () => {
    setRoomNumber("");
    setRoomFloor("");
    setRoomCapacity("2");
    setRoomRent("");
    setRoomPgId(pgs.length > 0 ? String(pgs[0].id) : "");
    setModalType("add_room");
  };

  const openAddTenantModal = () => {
    setTenantName("");
    setTenantEmail("");
    setTenantPhone("");
    setTenantPgId(pgs.length > 0 ? String(pgs[0].id) : "");
    setTenantRoomId("");
    setTenantDeposit("");
    setModalType("add_tenant");
  };

  const openCollectRentModal = (payment: any) => {
    setSelectedItem(payment);
    setPaymentAmount(String(payment.amount));
    setPaymentMethod("UPI");
    setPaymentRef(`UPI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setModalType("collect_rent");
  };

  const openAssignStaffModal = (complaint: any) => {
    setSelectedItem(complaint);
    setComplaintStaffId(complaint.assigned_to || "");
    setModalType("assign_staff");
  };

  // Helper lists for selects
  const ownersList = users.filter(u => u.role === "Owner");

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-sky-500 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-sky-500/20 flex items-center gap-2.5 border border-sky-400"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-slate-900 border-r border-slate-800/80 shrink-0 p-6">
        <div className="flex items-center gap-3.5 select-none mb-8">
          <img src="/logo.png" alt="PG Admin Logo" className="w-10 h-10 rounded-xl object-cover shadow-md shrink-0" />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white">PG Admin</span>
            <span className="text-[9px] font-black text-sky-400 tracking-wider uppercase mt-0.5">Control Console</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          <SidebarTab active={activeTab === "dashboard"} label="Dashboard" icon={LayoutDashboard} onClick={() => handleTabClick("dashboard")} />
          <SidebarTab active={activeTab === "pgs"} label="Properties (PGs)" icon={Building2} onClick={() => handleTabClick("pgs")} />
          <SidebarTab active={activeTab === "users"} label="User Directory" icon={Users} onClick={() => handleTabClick("users")} />
          <SidebarTab active={activeTab === "tenants"} label="Tenants Log" icon={UserCheck} onClick={() => handleTabClick("tenants")} />
          <SidebarTab active={activeTab === "rooms"} label="Rooms & Beds" icon={BedDouble} onClick={() => handleTabClick("rooms")} />
          <SidebarTab active={activeTab === "payments"} label="Platform Billing" icon={CreditCard} onClick={() => handleTabClick("payments")} />
          <SidebarTab active={activeTab === "complaints"} label="Support Desk" icon={AlertOctagon} onClick={() => handleTabClick("complaints")} />
          <SidebarTab active={activeTab === "logs"} label="Security Logs" icon={FileText} onClick={() => handleTabClick("logs")} />
        </nav>

        <div className="border-t border-slate-800/60 pt-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-3 rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
              SA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{currentUser?.name || "Admin"}</span>
              <span className="text-[8px] font-black uppercase text-sky-400 tracking-wider mt-0.5">Super Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full h-11 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-350 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Header Mobile / Navigation Bar */}
      <header className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800/80 px-5 py-4 shrink-0 w-full z-30">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="PG Admin Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-extrabold text-sm tracking-tight text-white">PG Admin</span>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col p-5 md:p-8 min-w-0 overflow-y-auto no-scrollbar relative z-10 pb-20 md:pb-8">
        
        {/* Dynamic header depending on the active tab */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {activeTab === "dashboard" && "Overview Statistics"}
              {activeTab === "pgs" && "Properties Registry"}
              {activeTab === "users" && "User Directory"}
              {activeTab === "tenants" && "Tenants Log"}
              {activeTab === "rooms" && "Rooms & Beds Occupancy"}
              {activeTab === "payments" && "Platform Billing Ledger"}
              {activeTab === "complaints" && "Complaints Support Desk"}
              {activeTab === "logs" && "Platform Audit Logs"}
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              {activeTab === "dashboard" && "Consolidated platform metrics and real-time dashboard."}
              {activeTab === "pgs" && "Register, suspend, and view subscription details of all PG businesses."}
              {activeTab === "users" && "Search, view, and modify roles of users registered across all properties."}
              {activeTab === "tenants" && "Global tenant listings, invite tokens, and checkout controls."}
              {activeTab === "rooms" && "Overview of rooms, floors, and current bed occupancies across all properties."}
              {activeTab === "payments" && "Consolidated log of all dues, collected rents, and transactions."}
              {activeTab === "complaints" && "Review and resolve tenant complaints, and modify staff assignments."}
              {activeTab === "logs" && "Platform security audit log and event feed."}
            </p>
          </div>

          <div className="flex gap-2.5 w-full md:w-auto">
            {activeTab !== "dashboard" && activeTab !== "logs" && (
              <div className="relative bg-slate-900 border border-slate-800 rounded-xl px-3 flex items-center h-11 w-full md:w-60 focus-within:border-sky-500 transition-colors">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="bg-transparent border-0 w-full h-full text-xs px-2 focus:outline-hidden font-semibold text-slate-300 placeholder-slate-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-slate-350 flex items-center justify-center w-8 h-8">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {activeTab === "pgs" && (
              <button
                onClick={openAddPgModal}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-4 h-11 rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 shadow-md shadow-sky-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register PG</span>
              </button>
            )}

            {activeTab === "rooms" && (
              <button
                onClick={openAddRoomModal}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-4 h-11 rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 shadow-md shadow-sky-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            )}

            {activeTab === "tenants" && (
              <button
                onClick={openAddTenantModal}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-4 h-11 rounded-xl text-xs uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 shadow-md shadow-sky-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Tenant</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6 shrink-0">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <DashboardCard title="Total PG Properties" value={`${stats.activePgs}/${stats.totalPgs}`} sub="Active / Total registered" icon={Building2} color="sky" />
                <DashboardCard title="Registered Accounts" value={stats.totalUsers} sub="Owners, tenants & staff" icon={Users} color="indigo" />
                <DashboardCard title="Active Boarders" value={stats.activeTenants} sub="Tenants currently checked in" icon={UserCheck} color="emerald" />
                <DashboardCard title="Lifetime Billings" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} sub="Collected rent revenue" icon={TrendingUp} color="violet" />
              </div>

              {/* Aggregated Section details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
                
                {/* Tickets Console Summary */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-rose-500/5 border border-rose-500/15 flex items-center justify-center text-rose-500">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Support Desk</span>
                    <h2 className="text-3xl font-black text-white mt-4">{stats.pendingComplaints}</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2">Active complaints requiring resolution.</p>
                  </div>
                  <button onClick={() => setActiveTab("complaints")} className="mt-6 border border-slate-800 hover:border-slate-700 bg-slate-950 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer">
                    Manage Support Tickets
                  </button>
                </div>

                {/* Subscriptions breakdown */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest leading-none">Subscription Billing</span>
                      <span className="text-3xl font-black text-white mt-4">
                        {pgs.filter(p => p.subscription_plan === "pro" || p.subscription_plan === "premium").length}
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-sky-500/15 border border-sky-500/30 text-sky-400 px-2 py-0.5 rounded-full uppercase shrink-0">Paid Plans</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-2">PG businesses subscribed to standard premium tiers.</p>
                  <button onClick={() => setActiveTab("pgs")} className="mt-6 border border-slate-800 hover:border-slate-700 bg-slate-950 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer">
                    Manage Properties
                  </button>
                </div>

                {/* Quick Boardings Stats */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Rooms Map</span>
                      <span className="text-3xl font-black text-white mt-4">
                        {rooms.filter(r => r.beds?.some((b: any) => b.status === "available")).length}
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full uppercase shrink-0">Rooms Available</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-2">Rooms with at least one unoccupied bed slot.</p>
                  <button onClick={() => setActiveTab("rooms")} className="mt-6 border border-slate-800 hover:border-slate-700 bg-slate-950 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer">
                    View Beds Layout
                  </button>
                </div>

              </div>

              {/* Latest Audit Logs Feed */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shrink-0 flex flex-col">
                <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4 select-none">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-sky-400" />
                    Latest System Activity
                  </h3>
                  <button onClick={() => setActiveTab("logs")} className="text-[10px] font-black text-sky-400 uppercase tracking-wider hover:text-sky-300 cursor-pointer">
                    View Logs Feed
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto no-scrollbar">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                      <div className="text-slate-500 font-semibold select-none shrink-0 w-24">
                        {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-sky-400 uppercase tracking-wider text-[10px] block lg:inline mr-2">{log.action}</span>
                        <span className="text-slate-300 font-bold">{log.details}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 shrink-0">
                        by {log.users?.name || "System"}
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500 font-bold">No system activity logged.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* LIST VIEWS: PGs, Users, Tenants, Rooms, Payments, Complaints, Logs */}
          {activeTab !== "dashboard" && (
            <div className="flex-grow flex flex-col min-h-0 bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
              {isLoading && (
                <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-3xs flex items-center justify-center z-25">
                  <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Desktop view Table */}
              <div className="hidden lg:block flex-1 overflow-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead className="bg-slate-950 border-b border-slate-800 sticky top-0 text-[10px] font-black text-slate-400 uppercase tracking-wider z-20">
                    {activeTab === "pgs" && (
                      <tr>
                        <th className="py-4.5 px-5">Property Name</th>
                        <th className="py-4.5 px-4">Address</th>
                        <th className="py-4.5 px-4">Owner Name</th>
                        <th className="py-4.5 px-4">Contact Phone</th>
                        <th className="py-4.5 px-4">Plan</th>
                        <th className="py-4.5 px-4">Status</th>
                        <th className="py-4.5 px-5 text-right">Actions</th>
                      </tr>
                    )}
                    {activeTab === "users" && (
                      <tr>
                        <th className="py-4.5 px-5">User Name</th>
                        <th className="py-4.5 px-4">Email</th>
                        <th className="py-4.5 px-4">Phone</th>
                        <th className="py-4.5 px-4">System Role</th>
                        <th className="py-4.5 px-4">Associated PG ID</th>
                        <th className="py-4.5 px-5 text-right">Actions</th>
                      </tr>
                    )}
                    {activeTab === "tenants" && (
                      <tr>
                        <th className="py-4.5 px-5">Tenant Name</th>
                        <th className="py-4.5 px-4">Contact Detail</th>
                        <th className="py-4.5 px-4">Property</th>
                        <th className="py-4.5 px-4">Allocated Room</th>
                        <th className="py-4.5 px-4">Deposit</th>
                        <th className="py-4.5 px-4">Token Invite</th>
                        <th className="py-4.5 px-5 text-right">Actions</th>
                      </tr>
                    )}
                    {activeTab === "rooms" && (
                      <tr>
                        <th className="py-4.5 px-5">Room Number</th>
                        <th className="py-4.5 px-4">Property</th>
                        <th className="py-4.5 px-4">Floor</th>
                        <th className="py-4.5 px-4">Capacity</th>
                        <th className="py-4.5 px-4">Rent Rate</th>
                        <th className="py-4.5 px-4">Current Bed Occupancies</th>
                        <th className="py-4.5 px-5 text-right">Status</th>
                      </tr>
                    )}
                    {activeTab === "payments" && (
                      <tr>
                        <th className="py-4.5 px-5">Tenant Name</th>
                        <th className="py-4.5 px-4">PG Property</th>
                        <th className="py-4.5 px-4">Month</th>
                        <th className="py-4.5 px-4">Amount</th>
                        <th className="py-4.5 px-4">Due Date</th>
                        <th className="py-4.5 px-4">Payment Method</th>
                        <th className="py-4.5 px-4">Ref Code</th>
                        <th className="py-4.5 px-4">Status</th>
                        <th className="py-4.5 px-5 text-right">Actions</th>
                      </tr>
                    )}
                    {activeTab === "complaints" && (
                      <tr>
                        <th className="py-4.5 px-5">Ticket Title</th>
                        <th className="py-4.5 px-4">Raising Tenant</th>
                        <th className="py-4.5 px-4">Property</th>
                        <th className="py-4.5 px-4">Severity</th>
                        <th className="py-4.5 px-4">Assigned To</th>
                        <th className="py-4.5 px-4">Status</th>
                        <th className="py-4.5 px-5 text-right">Actions</th>
                      </tr>
                    )}
                    {activeTab === "logs" && (
                      <tr>
                        <th className="py-4.5 px-5">Timestamp</th>
                        <th className="py-4.5 px-4">Action</th>
                        <th className="py-4.5 px-4">Details</th>
                        <th className="py-4.5 px-5">Triggered By</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-350 font-medium">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/20 transition-colors">
                        
                        {/* PGs Row */}
                        {activeTab === "pgs" && (
                          <>
                            <td className="py-4 px-5 font-bold text-white">{item.name}</td>
                            <td className="py-4 px-4 truncate max-w-40">{item.address}</td>
                            <td className="py-4 px-4 font-bold text-slate-300">{item.users?.name || "Unassigned"}</td>
                            <td className="py-4 px-4">{item.phone}</td>
                            <td className="py-4 px-4 uppercase tracking-wider text-[10px] font-black text-sky-400">{item.subscription_plan || "free"}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                item.is_active !== false
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              }`}>
                                {item.is_active !== false ? "active" : "suspended"}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex items-center justify-end gap-1.5 h-full">
                              <button
                                onClick={() => handleTogglePg(item.id, item.is_active !== false)}
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  item.is_active !== false
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-450 hover:bg-rose-500/20"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                }`}
                                title={item.is_active !== false ? "Suspend PG" : "Activate PG"}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditPgModal(item)}
                                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </>
                        )}

                        {/* Users Row */}
                        {activeTab === "users" && (
                          <>
                            <td className="py-4 px-5 font-bold text-white">{item.name}</td>
                            <td className="py-4 px-4 truncate max-w-40">{item.email}</td>
                            <td className="py-4 px-4">{item.phone || "N/A"}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                item.role === "Super Admin" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                item.role === "Owner" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                                item.role === "Manager" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" :
                                item.role === "Staff" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-slate-800 text-slate-300"
                              }`}>
                                {item.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-400">#{item.pg_id || "Global"}</td>
                            <td className="py-4 px-5 text-right">
                              {item.id !== currentUser.id && (
                                <button
                                  onClick={() => openEditUserModal(item)}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </>
                        )}

                        {/* Tenants Row */}
                        {activeTab === "tenants" && (
                          <>
                            <td className="py-4 px-5 font-bold text-white">{item.name}</td>
                            <td className="py-4 px-4 flex flex-col">
                              <span>{item.email}</span>
                              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">{item.phone}</span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-300">{item.pgs?.name || "Unknown"}</td>
                            <td className="py-4 px-4 font-bold text-slate-400">{item.rooms?.room_number || "Unassigned"}</td>
                            <td className="py-4 px-4">₹{item.deposit?.toLocaleString("en-IN") || "0"}</td>
                            <td className="py-4 px-4">
                              {item.user_id ? (
                                <span className="text-emerald-450 font-bold text-[10px] flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Bound
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded text-sky-400">
                                  {item.invite_token}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {item.status === "active" && (
                                <button
                                  onClick={() => handleEvictTenant(item)}
                                  className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:text-rose-300 cursor-pointer"
                                  title="Checkout/Evict Resident"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </>
                        )}

                        {/* Rooms Row */}
                        {activeTab === "rooms" && (
                          <>
                            <td className="py-4 px-5 font-bold text-white">{item.room_number}</td>
                            <td className="py-4 px-4 text-slate-300">{item.pgs?.name || "Unknown"}</td>
                            <td className="py-4 px-4">Floor {item.floor}</td>
                            <td className="py-4 px-4">{item.capacity} Beds</td>
                            <td className="py-4 px-4">₹{item.rent?.toLocaleString("en-IN") || "0"}</td>
                            <td className="py-4 px-4 flex gap-1.5">
                              {(item.beds || []).map((bed: any, bIdx: number) => (
                                <span
                                  key={bed.id}
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    bed.status === "occupied" ? "bg-rose-500" : "bg-emerald-500"
                                  }`}
                                  title={`${bed.bed_number}: ${bed.status}`}
                                />
                              ))}
                            </td>
                            <td className="py-4 px-5">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                (item.beds || []).every((b: any) => b.status === "occupied")
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                {(item.beds || []).every((b: any) => b.status === "occupied") ? "Full" : "Available"}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Payments Row */}
                        {activeTab === "payments" && (
                          <>
                            <td className="py-4 px-5 font-bold text-white">{item.tenants?.users?.name || item.tenants?.name || "Unknown"}</td>
                            <td className="py-4 px-4 text-slate-350">{item.pgs?.name || "N/A"}</td>
                            <td className="py-4 px-4 font-bold text-slate-400">{item.month}</td>
                            <td className="py-4 px-4 font-bold text-white">₹{item.amount?.toLocaleString("en-IN") || "0"}</td>
                            <td className="py-4 px-4">{item.due_date || "N/A"}</td>
                            <td className="py-4 px-4 uppercase text-[10px]">{item.payment_method || "N/A"}</td>
                            <td className="py-4 px-4 font-mono text-[10px] text-slate-500">{item.reference_code || "N/A"}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                item.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450" :
                                item.status === "overdue" ? "bg-rose-500/10 border-rose-500/20 text-rose-450 animate-pulse" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-450"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              {item.status !== "paid" && (
                                <button
                                  onClick={() => openCollectRentModal(item)}
                                  className="p-1.5 rounded-lg border border-sky-500/20 bg-sky-500/5 text-sky-400 hover:text-sky-350 cursor-pointer"
                                  title="Manually Log Payment"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </>
                        )}

                        {/* Complaints Row */}
                        {activeTab === "complaints" && (
                          <>
                            <td className="py-4 px-5 font-bold text-white">{item.title}</td>
                            <td className="py-4 px-4 text-slate-300 font-bold">{item.tenants?.users?.name || item.tenants?.name || "Unknown Tenant"}</td>
                            <td className="py-4 px-4">{item.pgs?.name || "N/A"}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                item.severity === "high" ? "bg-rose-500/15 text-rose-400" :
                                item.severity === "medium" ? "bg-amber-500/15 text-amber-400" :
                                "bg-sky-500/15 text-sky-400"
                              }`}>
                                {item.severity}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-450 font-bold">
                              {staffList.find(s => s.id === item.assigned_to)?.name || "Unassigned"}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                item.status === "resolved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                item.status === "in_progress" ? "bg-sky-500/10 border-sky-500/20 text-sky-400" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {item.status?.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right flex items-center justify-end gap-1.5 h-full">
                              <button
                                onClick={() => handleUpdateComplaintStatus(item.id, item.status)}
                                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white cursor-pointer"
                                title="Cycle Status"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openAssignStaffModal(item)}
                                className="p-1.5 rounded-lg border border-sky-500/20 bg-sky-500/5 text-sky-400 hover:text-white cursor-pointer"
                                title="Reassign Staff"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </>
                        )}

                        {/* Security Logs Row */}
                        {activeTab === "logs" && (
                          <>
                            <td className="py-4 px-5 text-slate-500 select-none font-bold">
                              {new Date(item.created_at).toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 px-4 uppercase tracking-wider font-black text-sky-400 text-[10px]">{item.action}</td>
                            <td className="py-4 px-4 font-bold text-slate-200">{item.details}</td>
                            <td className="py-4 px-5 text-slate-400">{item.users?.name || "System/Trigger"}</td>
                          </>
                        )}

                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500 font-bold">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="lg:hidden flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4.5 flex flex-col gap-3.5 relative overflow-hidden">
                    
                    {/* PG Mobile Card */}
                    {activeTab === "pgs" && (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-white text-xs leading-none truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Plan: {item.subscription_plan || "free"}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            item.is_active !== false ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          }`}>
                            {item.is_active !== false ? "active" : "suspended"}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs flex flex-col gap-1.5">
                          <p className="text-slate-400">Owner: <span className="font-bold text-slate-200">{item.users?.name || "Unassigned"}</span></p>
                          <p className="text-slate-400 truncate">Address: <span className="font-semibold text-slate-300">{item.address}</span></p>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => handleTogglePg(item.id, item.is_active !== false)}
                            className={`h-11 px-4 rounded-xl border text-xs font-extrabold uppercase tracking-wider cursor-pointer ${
                              item.is_active !== false ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            }`}
                          >
                            {item.is_active !== false ? "Suspend" : "Activate"}
                          </button>
                          <button onClick={() => openEditPgModal(item)} className="h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-extrabold uppercase tracking-wider cursor-pointer">
                            Edit details
                          </button>
                        </div>
                      </>
                    )}

                    {/* Users Mobile Card */}
                    {activeTab === "users" && (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white text-xs truncate">{item.name}</span>
                            <span className="text-[9.5px] text-slate-500 mt-1 truncate">{item.email}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.role === "Super Admin" ? "bg-rose-500/10 text-rose-400" :
                            item.role === "Owner" ? "bg-sky-500/10 text-sky-400" :
                            item.role === "Manager" ? "bg-violet-500/10 text-violet-400" :
                            item.role === "Staff" ? "bg-amber-500/10 text-amber-400" :
                            "bg-slate-800 text-slate-300"
                          }`}>
                            {item.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span>Phone: <span className="font-bold text-slate-200">{item.phone || "N/A"}</span></span>
                          <span>PG ID: <span className="font-bold text-slate-200">#{item.pg_id || "Global"}</span></span>
                        </div>
                        {item.id !== currentUser.id && (
                          <div className="flex justify-end pt-1 border-t border-slate-900">
                            <button onClick={() => openEditUserModal(item)} className="h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-extrabold uppercase tracking-wider cursor-pointer">
                              Edit credentials & Role
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Tenants Mobile Card */}
                    {activeTab === "tenants" && (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs">{item.name}</span>
                            <span className="text-[9.5px] text-slate-500 mt-0.5">{item.email}</span>
                          </div>
                          <span className="text-xs font-black text-slate-400">Room {item.rooms?.room_number || "N/A"}</span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs flex flex-col gap-1.5">
                          <p className="text-slate-400">PG: <span className="font-bold text-slate-200">{item.pgs?.name || "Unknown"}</span></p>
                          <p className="text-slate-400">Deposit: <span className="font-bold text-slate-350">₹{item.deposit}</span></p>
                          <p className="text-slate-400 truncate">Token: <span className="font-mono text-sky-400 font-bold bg-slate-950 px-2 py-0.5 rounded ml-1">{item.user_id ? "Bound Profile" : item.invite_token}</span></p>
                        </div>
                        {item.status === "active" && (
                          <div className="flex justify-end pt-1 border-t border-slate-900">
                            <button onClick={() => handleEvictTenant(item)} className="h-11 px-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-450 text-xs font-extrabold uppercase tracking-wider cursor-pointer">
                              Checkout Resident
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Rooms Mobile Card */}
                    {activeTab === "rooms" && (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs">{item.room_number}</span>
                            <span className="text-[9.5px] text-slate-500 mt-0.5">Floor {item.floor} | {item.capacity} Bed Capacity</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            (item.beds || []).every((b: any) => b.status === "occupied") ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {(item.beds || []).every((b: any) => b.status === "occupied") ? "Full" : "Available"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span>Rent: <span className="font-bold text-slate-200">₹{item.rent}</span></span>
                          <span className="flex gap-1">
                            Beds:
                            {(item.beds || []).map((bed: any) => (
                              <span key={bed.id} className={`w-2 h-2 rounded-full ${bed.status === "occupied" ? "bg-rose-500" : "bg-emerald-500"}`} />
                            ))}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Payments Mobile Card */}
                    {activeTab === "payments" && (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs">{item.tenants?.users?.name || item.tenants?.name || "Resident"}</span>
                            <span className="text-[9.5px] text-slate-500 mt-0.5">Month: {item.month}</span>
                          </div>
                          <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            item.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs flex flex-col gap-1">
                          <p className="text-slate-400">PG: <span className="font-bold text-slate-200">{item.pgs?.name || "N/A"}</span></p>
                          <p className="text-slate-400 font-bold">Amount: <span className="text-white">₹{item.amount}</span></p>
                          <p className="text-slate-400">Due: <span className="font-semibold text-slate-300">{item.due_date}</span></p>
                          <p className="text-slate-450 truncate">Ref: <span className="font-mono text-slate-500">{item.reference_code || "N/A"}</span></p>
                        </div>
                        {item.status !== "paid" && (
                          <div className="flex justify-end pt-1 border-t border-slate-900">
                            <button onClick={() => openCollectRentModal(item)} className="h-11 px-4 rounded-xl border border-sky-500/25 bg-sky-500/5 text-sky-400 text-xs font-extrabold uppercase tracking-wider cursor-pointer">
                              Record Payment
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Complaints Mobile Card */}
                    {activeTab === "complaints" && (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs">{item.title}</span>
                            <span className="text-[9.5px] text-slate-500 mt-0.5">Severity: <span className="text-rose-450 uppercase font-black">{item.severity}</span></span>
                          </div>
                          <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.status === "resolved" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400 animate-pulse"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 text-xs flex flex-col gap-1.5">
                          <p className="text-slate-400">Tenant: <span className="font-bold text-slate-200">{item.tenants?.users?.name || item.tenants?.name || "Unknown"}</span></p>
                          <p className="text-slate-450">Staff: <span className="font-bold text-sky-400">{staffList.find(s => s.id === item.assigned_to)?.name || "Unassigned"}</span></p>
                          <p className="text-slate-400 mt-1">{item.description}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                          <button onClick={() => handleUpdateComplaintStatus(item.id, item.status)} className="h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-extrabold uppercase tracking-wider cursor-pointer">
                            Cycle status
                          </button>
                          <button onClick={() => openAssignStaffModal(item)} className="h-11 px-4 rounded-xl border border-sky-500/20 bg-sky-500/5 text-sky-450 text-xs font-extrabold uppercase tracking-wider cursor-pointer">
                            Assign Staff
                          </button>
                        </div>
                      </>
                    )}

                    {/* Logs Mobile Card */}
                    {activeTab === "logs" && (
                      <>
                        <div className="flex justify-between items-start text-xs font-semibold">
                          <span className="text-slate-500">{new Date(item.created_at).toLocaleString("en-IN")}</span>
                          <span className="text-sky-450 font-black uppercase tracking-wider text-[9px]">{item.action}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-200 mt-1">{item.details}</p>
                        <span className="text-[10px] text-slate-550 block mt-2 text-right">by {item.users?.name || "System"}</span>
                      </>
                    )}

                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-slate-500 font-bold">No records found.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Slide-out Navigation Drawer for Mobile */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-10"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="absolute right-0 top-0 bottom-0 w-[270px] bg-slate-900 border-l border-slate-800 p-6 z-20 flex flex-col justify-between h-full"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="PG Admin Logo" className="w-5 h-5 rounded-md object-cover" />
                    <span className="font-extrabold text-sm text-white">PG Admin</span>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-full bg-slate-800 text-slate-450">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  <SidebarTab active={activeTab === "dashboard"} label="Dashboard" icon={LayoutDashboard} onClick={() => handleTabClick("dashboard")} />
                  <SidebarTab active={activeTab === "pgs"} label="Properties (PGs)" icon={Building2} onClick={() => handleTabClick("pgs")} />
                  <SidebarTab active={activeTab === "users"} label="User Directory" icon={Users} onClick={() => handleTabClick("users")} />
                  <SidebarTab active={activeTab === "tenants"} label="Tenants Log" icon={UserCheck} onClick={() => handleTabClick("tenants")} />
                  <SidebarTab active={activeTab === "rooms"} label="Rooms & Beds" icon={BedDouble} onClick={() => handleTabClick("rooms")} />
                  <SidebarTab active={activeTab === "payments"} label="Platform Billing" icon={CreditCard} onClick={() => handleTabClick("payments")} />
                  <SidebarTab active={activeTab === "complaints"} label="Support Desk" icon={AlertOctagon} onClick={() => handleTabClick("complaints")} />
                  <SidebarTab active={activeTab === "logs"} label="Security Logs" icon={FileText} onClick={() => handleTabClick("logs")} />
                </nav>
              </div>

              <div className="flex flex-col gap-3.5 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-extrabold">SA</div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{currentUser?.name}</span>
                    <span className="text-[8px] font-black uppercase text-sky-400 mt-0.5 tracking-wider">Super Admin</span>
                  </div>
                </div>
                <button
                  onClick={() => { setIsDrawerOpen(false); handleLogout(); }}
                  className="flex items-center justify-center gap-2 w-full h-11 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORM MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-10"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative z-20 shadow-2xl flex flex-col gap-5 text-left text-slate-100"
            >
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-sky-400" />
                  {modalType === "add_pg" && "Register PG Property"}
                  {modalType === "edit_pg" && "Edit Property Details"}
                  {modalType === "edit_user" && "Update User Role"}
                  {modalType === "add_room" && "Create Room & Beds"}
                  {modalType === "add_tenant" && "Manual Tenant Onboarding"}
                  {modalType === "collect_rent" && "Log Payment Record"}
                  {modalType === "assign_staff" && "Reassign Support Staff"}
                </h3>
                <button onClick={() => setModalType(null)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* FORM: REGISTER / EDIT PG */}
              {(modalType === "add_pg" || modalType === "edit_pg") && (
                <form onSubmit={modalType === "add_pg" ? handleCreatePgSubmit : handleEditPgSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">PG Business Name</label>
                    <input type="text" required value={pgName} onChange={(e) => setPgName(e.target.value)} placeholder="e.g. Olive Co-Living" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Address Location</label>
                    <input type="text" required value={pgAddress} onChange={(e) => setPgAddress(e.target.value)} placeholder="e.g. Koramangala Layout" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Contact Phone</label>
                    <input type="text" required value={pgPhone} onChange={(e) => setPgPhone(e.target.value)} placeholder="e.g. +91 99887 76655" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assign Owner Profile</label>
                    <select required value={pgOwnerId} onChange={(e) => setPgOwnerId(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="">Select Owner</option>
                      {ownersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Subscription Tier</label>
                    <select value={pgPlan} onChange={(e) => setPgPlan(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="free">Free Trial</option>
                      <option value="pro">Pro Plan</option>
                      <option value="premium">Premium Suite</option>
                    </select>
                  </div>
                  <button type="submit" className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                    {modalType === "add_pg" ? "Create Registration" : "Save Alterations"}
                  </button>
                </form>
              )}

              {/* FORM: EDIT USER */}
              {modalType === "edit_user" && (
                <form onSubmit={handleEditUserSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">User Name</label>
                    <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Full Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Phone</label>
                    <input type="text" required value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="Phone Number" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Platform Role</label>
                    <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="Tenant">Tenant</option>
                      <option value="Owner">Owner (Landlord)</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Support Staff</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Associated Property (PG ID)</label>
                    <select value={userPgId} onChange={(e) => setUserPgId(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="">None (Global / Admin)</option>
                      {pgs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                    Save Changes
                  </button>
                </form>
              )}

              {/* FORM: ADD ROOM */}
              {modalType === "add_room" && (
                <form onSubmit={handleAddRoomSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Select PG Property</label>
                    <select value={roomPgId} onChange={(e) => setRoomPgId(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      {pgs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Room Number</label>
                    <input type="text" required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. Room 101" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Floor Level</label>
                    <input type="number" required value={roomFloor} onChange={(e) => setRoomFloor(e.target.value)} placeholder="e.g. 1" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Bed Capacity</label>
                    <select value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="1">1 Bed (Single)</option>
                      <option value="2">2 Beds (Double Sharing)</option>
                      <option value="3">3 Beds (Triple Sharing)</option>
                      <option value="4">4 Beds (Quadruple Sharing)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Rent Amount (per month)</label>
                    <input type="number" required value={roomRent} onChange={(e) => setRoomRent(e.target.value)} placeholder="e.g. 6500" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <button type="submit" className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                    Create Room
                  </button>
                </form>
              )}

              {/* FORM: ADD TENANT */}
              {modalType === "add_tenant" && (
                <form onSubmit={handleAddTenantSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Select PG Property</label>
                    <select value={tenantPgId} onChange={(e) => { setTenantPgId(e.target.value); setTenantRoomId(""); }} required className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      {pgs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tenant Full Name</label>
                    <input type="text" required value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Tenant Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                    <input type="email" required value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} placeholder="tenant@example.com" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Phone Number</label>
                    <input type="text" required value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)} placeholder="+91 98765 43210" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Select Allocated Room</label>
                    <select value={tenantRoomId} onChange={(e) => setTenantRoomId(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="">Choose Room</option>
                      {rooms.filter(r => String(r.pg_id) === tenantPgId && r.beds?.some((b: any) => b.status === "available")).map(r => (
                        <option key={r.id} value={r.id}>{r.room_number} (Floor {r.floor} | rent: ₹{r.rent})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Security Deposit</label>
                    <input type="number" required value={tenantDeposit} onChange={(e) => setTenantDeposit(e.target.value)} placeholder="e.g. 10000" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <button type="submit" className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                    Board Tenant
                  </button>
                </form>
              )}

              {/* FORM: COLLECT RENT */}
              {modalType === "collect_rent" && (
                <form onSubmit={handleCollectRentSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Amount Collected (₹)</label>
                    <input type="number" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Payment Mode</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="UPI">UPI Transfer</option>
                      <option value="Cash">Cash Receipt</option>
                      <option value="Bank Transfer">Bank NetBanking</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Transaction Reference Code</label>
                    <input type="text" required value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="TXN Ref Number" className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-white focus:outline-hidden focus:border-sky-500" />
                  </div>
                  <button type="submit" className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                    Log Collection Record
                  </button>
                </form>
              )}

              {/* FORM: ASSIGN SUPPORT STAFF */}
              {modalType === "assign_staff" && (
                <form onSubmit={handleAssignStaffSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Select Staff Member</label>
                    <select value={complaintStaffId} onChange={(e) => setComplaintStaffId(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-xl px-4 h-11 text-xs text-slate-300 focus:outline-hidden focus:border-sky-500">
                      <option value="">Choose Staff</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.phone || "No Phone"})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="mt-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold h-11 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
                    Confirm Assignment
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Side tab link button component
interface SidebarTabProps {
  active: boolean;
  label: string;
  icon: any;
  onClick: () => void;
}

function SidebarTab({ active, label, icon: Icon, onClick }: SidebarTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full h-11 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none ${
        active
          ? "bg-sky-500/10 border border-sky-500/20 text-sky-400"
          : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
      }`}
    >
      <Icon className="w-4.5 h-4.5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

// Stats overview card widget
interface DashboardCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: any;
  color: "sky" | "indigo" | "emerald" | "violet";
}

function DashboardCard({ title, value, sub, icon: Icon, color }: DashboardCardProps) {
  const colorMap = {
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400"
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-xs relative overflow-hidden">
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{title}</span>
        <span className="text-2xl font-black text-white mt-3 leading-none">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 mt-2 leading-none truncate">{sub}</span>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
