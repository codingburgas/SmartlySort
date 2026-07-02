"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Trash2, AlertCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { users as usersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";

const EMPTY = { firstName: "", lastName: "", username: "", email: "", password: "", role: "INVENTORY_STAFF" };

const inputCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)]";
const selectCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)]";

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMINISTRATOR")) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && user.role === "ADMINISTRATOR") load();
  }, [authLoading, user]);

  async function load() {
    setTableLoading(true);
    try {
      const data = await usersApi.list();
      setUsersList(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setTableLoading(false);
    }
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      await usersApi.create(form);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await usersApi.remove(id);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  if (authLoading || !user || user.role !== "ADMINISTRATOR") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Users</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">Manage staff accounts and access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="text-base font-semibold text-[var(--fg)] mb-4 flex items-center gap-2">
            <UserPlus size={18} />
            Create User
          </h2>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--fg)]">First Name</label>
                <input className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required placeholder="John" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--fg)]">Last Name</label>
                <input className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required placeholder="Doe" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg)]">Username</label>
              <input className={inputCls} value={form.username} onChange={(e) => set("username", e.target.value)} required placeholder="johndoe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg)]">Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="john@company.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg)]">Password</label>
              <input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="••••••••" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg)]">Role</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)} className={selectCls}>
                <option value="INVENTORY_STAFF">Inventory Staff</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="justify-center mt-1">
              {loading ? "Creating…" : "Create User"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold text-[var(--fg)]">All Users</h2>
          {error && <div className="text-sm text-[var(--destructive)]">{error}</div>}
          <Card className="overflow-hidden">
            {tableLoading ? (
              <div className="p-5"><SkeletonTable rows={5} cols={5} /></div>
            ) : usersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={40} className="text-[var(--border)] mb-3" />
                <p className="font-semibold text-[var(--fg)]">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <tr>
                      {["Name", "Username", "Email", "Role", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--muted)] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--fg)]">{u.firstName} {u.lastName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[var(--muted-fg)]">{u.username}</td>
                        <td className="px-4 py-3 text-[var(--muted-fg)]">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === "ADMINISTRATOR" ? "info" : "default"}>
                            {u.role === "ADMINISTRATOR" ? "Admin" : "Staff"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(u.id)}
                            disabled={u.id === user.id}
                            className="text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
