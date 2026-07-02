"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Warehouse, MapPin, Plus, Users, X, Trash2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import { warehouses as warehousesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

function NewWarehouseModal({ onClose, onCreated, userId }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const w = await warehousesApi.create({ name, location, ownerId: userId });
      onCreated(w);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--fg)]">New Warehouse</h2>
          <button onClick={onClose} className="text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer">
            <X size={18} />
          </button>
        </div>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg)]">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)]"
              placeholder="Warehouse name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg)]">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)]"
              placeholder="City, Country"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 justify-center">
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function MembersModal({ warehouse, onClose }) {
  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await warehousesApi.listMembers(warehouse.id);
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!invite.trim()) return;
    setInviting(true);
    setError("");
    try {
      await warehousesApi.addMember(warehouse.id, invite.trim());
      setInvite("");
      await loadMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId) {
    try {
      await warehousesApi.removeMember(warehouse.id, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--fg)]">Members — {warehouse.name}</h2>
          <button onClick={onClose} className="text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <input
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            placeholder="Username or email"
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)]"
          />
          <Button type="submit" disabled={inviting} size="sm">
            {inviting ? "Adding…" : "Add"}
          </Button>
        </form>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))
          ) : members.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)] text-center py-4">No members yet</p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--muted)]">
                <div>
                  <p className="text-sm font-medium text-[var(--fg)]">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{m.username}</p>
                </div>
                <button
                  onClick={() => handleRemove(m.id)}
                  className="text-[var(--muted-fg)] hover:text-[var(--destructive)] transition-colors cursor-pointer p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

export default function WarehousesPage() {
  const { user, loading: authLoading } = useAuth();
  const { warehouses, selectWarehouse, refreshWarehouses, loading } = useWarehouse();
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [membersWarehouse, setMembersWarehouse] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  function handleCreated(w) {
    setShowNew(false);
    refreshWarehouses();
  }

  function handleSelectWarehouse(w) {
    selectWarehouse(w);
    router.push("/");
  }

  if (authLoading || !user) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Warehouses</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-1">Select or manage your warehouses</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} />
          New Warehouse
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Warehouse size={48} className="text-[var(--border)] mb-4" />
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-1">No warehouses yet</h2>
          <p className="text-sm text-[var(--muted-fg)] mb-4">Create your first warehouse to get started</p>
          <Button onClick={() => setShowNew(true)}>
            <Plus size={16} />
            Create Warehouse
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <Card key={w.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg bg-[var(--accent)] bg-opacity-10 flex items-center justify-center"
                  style={{ backgroundColor: "rgb(5 150 105 / 0.1)" }}
                >
                  <Warehouse size={20} className="text-[var(--accent)]" />
                </div>
                <Badge variant="outline">{String(w.id).startsWith("1") ? "Owner" : "Member"}</Badge>
              </div>
              <h2
                className="font-bold text-[var(--fg)] mb-1 group-hover:text-[var(--accent)] transition-colors"
                onClick={() => handleSelectWarehouse(w)}
              >
                {w.name}
              </h2>
              {w.location && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted-fg)] mb-4">
                  <MapPin size={12} />
                  {w.location}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => handleSelectWarehouse(w)}
                >
                  Select
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMembersWarehouse(w)}
                >
                  <Users size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showNew && (
        <NewWarehouseModal
          userId={user.id}
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
        />
      )}

      {membersWarehouse && (
        <MembersModal
          warehouse={membersWarehouse}
          onClose={() => setMembersWarehouse(null)}
        />
      )}
    </div>
  );
}
