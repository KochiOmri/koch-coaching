"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Package,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

interface CoachingPackage {
  id: string;
  name: string;
  description: string;
  sessionCount: number;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

interface ClientPackage {
  id: string;
  clientId: string;
  packageId: string;
  sessionsUsed: number;
  sessionsTotal: number;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "completed";
  createdAt: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<CoachingPackage[]>([]);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionCount, setSessionCount] = useState(1);
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [isActive, setIsActive] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPackageId, setAssignPackageId] = useState<string | null>(null);
  const [assignClientId, setAssignClientId] = useState("");
  const [assignExpiry, setAssignExpiry] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pkgRes, cpRes, clientRes] = await Promise.all([
        fetch("/api/packages"),
        fetch("/api/client-packages"),
        fetch("/api/clients"),
      ]);
      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (cpRes.ok) setClientPackages(await cpRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setSessionCount(1);
    setPrice(0);
    setDuration("");
    setFeatures([""]);
    setIsActive(true);
  };

  const startEdit = (pkg: CoachingPackage) => {
    setEditingId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description);
    setSessionCount(pkg.sessionCount);
    setPrice(pkg.price);
    setDuration(pkg.duration);
    setFeatures(pkg.features.length > 0 ? pkg.features : [""]);
    setIsActive(pkg.isActive);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!name || !sessionCount) return;
    setSaving(true);

    const body = {
      ...(editingId ? { id: editingId } : {}),
      name,
      description,
      sessionCount,
      price,
      duration,
      features: features.filter((f) => f.trim()),
      isActive,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/packages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchData();
        resetForm();
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const openAssignModal = (packageId: string) => {
    setAssignPackageId(packageId);
    setAssignClientId("");
    setAssignExpiry("");
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assignClientId || !assignPackageId) return;
    const pkg = packages.find((p) => p.id === assignPackageId);
    if (!pkg) return;

    setSaving(true);
    try {
      const res = await fetch("/api/client-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: assignClientId,
          packageId: assignPackageId,
          sessionsTotal: pkg.sessionCount,
          expiryDate: assignExpiry || "",
        }),
      });
      if (res.ok) {
        await fetchData();
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error("Assign failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSessions = async (cpId: string, sessionsUsed: number) => {
    try {
      await fetch("/api/client-packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cpId, sessionsUsed }),
      });
      await fetchData();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const updateFeature = (idx: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === idx ? value : f)));
  };

  const removeFeature = (idx: number) => {
    if (features.length <= 1) return;
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name || "Unknown";

  const getPackageName = (packageId: string) =>
    packages.find((p) => p.id === packageId)?.name || "Unknown";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Packages
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Manage coaching packages and client subscriptions
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                <Plus size={16} />
                New Package
              </button>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* Create / Edit Form */}
          {showForm && (
            <div
              className="mb-8 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {editingId ? "Edit Package" : "New Package"}
                </h2>
                <button onClick={resetForm} style={{ color: "var(--muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Transformation Package"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the package..."
                    rows={3}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Sessions</label>
                  <input
                    type="number"
                    min={1}
                    value={sessionCount}
                    onChange={(e) => setSessionCount(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Price (₪)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Duration</label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 12 weeks"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className="flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{ backgroundColor: isActive ? "var(--primary)" : "var(--card-border)" }}
                    >
                      <span
                        className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                        style={{ transform: isActive ? "translateX(22px)" : "translateX(2px)" }}
                      />
                    </button>
                    {isActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>

              {/* Features */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">Features</label>
                  <button
                    onClick={() => setFeatures([...features, ""])}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    <Plus size={14} />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={14} style={{ color: "var(--primary)" }} className="shrink-0" />
                      <input
                        value={feature}
                        onChange={(e) => updateFeature(idx, e.target.value)}
                        placeholder={`Feature ${idx + 1}...`}
                        className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
                        style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                      />
                      {features.length > 1 && (
                        <button
                          onClick={() => removeFeature(idx)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !name || !sessionCount}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingId ? "Update Package" : "Create Package"}
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Packages List */}
          <div className="space-y-4">
            {packages.length === 0 && !showForm ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <Package size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  No packages yet
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Create your first coaching package
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  <Plus size={16} />
                  Create Package
                </button>
              </div>
            ) : (
              packages.map((pkg) => {
                const assigned = clientPackages.filter((cp) => cp.packageId === pkg.id);
                return (
                  <div
                    key={pkg.id}
                    className="rounded-2xl border"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "var(--primary)" + "15" }}
                      >
                        <Package size={18} style={{ color: "var(--primary)" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                            {pkg.name}
                          </h3>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: pkg.isActive ? "#10b98120" : "#ef444420",
                              color: pkg.isActive ? "#10b981" : "#ef4444",
                            }}
                          >
                            {pkg.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {pkg.duration || `${pkg.sessionCount} sessions`}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            ₪{pkg.price.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {assigned.length} assigned
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openAssignModal(pkg.id)}
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ color: "var(--primary)" }}
                          title="Assign to Client"
                        >
                          <UserPlus size={14} />
                          <span className="hidden sm:inline">Assign</span>
                        </button>
                        <button
                          onClick={() => startEdit(pkg)}
                          className="rounded-lg p-2 transition-colors hover:bg-white/5"
                          style={{ color: "var(--muted)" }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {pkg.description && (
                      <div className="border-t px-5 py-3" style={{ borderColor: "var(--card-border)" }}>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>{pkg.description}</p>
                      </div>
                    )}

                    {pkg.features.length > 0 && (
                      <div className="border-t px-5 py-3" style={{ borderColor: "var(--card-border)" }}>
                        <div className="flex flex-wrap gap-2">
                          {pkg.features.map((f, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
                              style={{ backgroundColor: "var(--background)", color: "var(--muted)" }}
                            >
                              <CheckCircle2 size={10} style={{ color: "var(--primary)" }} />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned clients with progress */}
                    {assigned.length > 0 && (
                      <div className="border-t px-5 py-4" style={{ borderColor: "var(--card-border)" }}>
                        <span className="mb-3 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                          Client Assignments
                        </span>
                        <div className="space-y-3">
                          {assigned.map((cp) => {
                            const pct = cp.sessionsTotal > 0
                              ? Math.round((cp.sessionsUsed / cp.sessionsTotal) * 100)
                              : 0;
                            return (
                              <div key={cp.id} className="rounded-xl p-3" style={{ backgroundColor: "var(--background)" }}>
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-sm font-medium">{getClientName(cp.clientId)}</span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                                      style={{
                                        backgroundColor: cp.status === "active" ? "#10b98120" : cp.status === "completed" ? "var(--primary)" + "20" : "#ef444420",
                                        color: cp.status === "active" ? "#10b981" : cp.status === "completed" ? "var(--primary)" : "#ef4444",
                                      }}
                                    >
                                      {cp.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${pct}%`, backgroundColor: "var(--primary)" }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                                    {cp.sessionsUsed}/{cp.sessionsTotal}
                                  </span>
                                  {cp.status === "active" && cp.sessionsUsed < cp.sessionsTotal && (
                                    <button
                                      onClick={() => handleUpdateSessions(cp.id, cp.sessionsUsed + 1)}
                                      className="rounded-lg px-2 py-1 text-[10px] font-medium transition-colors hover:opacity-80"
                                      style={{ backgroundColor: "var(--primary)" + "20", color: "var(--primary)" }}
                                    >
                                      +1 Session
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAssignModal(false)}>
          <div
            className="mx-4 w-full max-w-md rounded-2xl border p-6"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                Assign Package
              </h3>
              <button onClick={() => setShowAssignModal(false)} style={{ color: "var(--muted)" }}>
                <X size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
              Assign <strong>{getPackageName(assignPackageId || "")}</strong> to a client
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Client</label>
                <select
                  value={assignClientId}
                  onChange={(e) => setAssignClientId(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={assignExpiry}
                  onChange={(e) => setAssignExpiry(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAssign}
                disabled={saving || !assignClientId}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Assign
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-full border px-6 py-2.5 text-sm font-medium"
                style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
