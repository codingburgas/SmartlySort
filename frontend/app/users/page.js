"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { users as usersApi } from "@/lib/api";

const EMPTY = { firstName: "", lastName: "", username: "", email: "", password: "", role: "INVENTORY_STAFF" };

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMINISTRATOR")) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && user.role === "ADMINISTRATOR") load();
  }, [authLoading, user]);

  async function load() {
    try {
      const data = await usersApi.list();
      setUsersList(data);
    } catch (e) {
      setError(e.message);
    }
  }

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
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

  if (authLoading || !user || user.role !== "ADMINISTRATOR") return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Users</h1>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8 max-w-lg">
        <h2 className="text-lg font-medium text-slate-700 mb-4">Create User</h2>
        {formError && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: "First Name", field: "firstName", type: "text" },
            { label: "Last Name", field: "lastName", type: "text" },
            { label: "Username", field: "username", type: "text" },
            { label: "Email", field: "email", type: "email" },
            { label: "Password", field: "password", type: "password" },
          ].map(({ label, field, type }) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select value={form.role} onChange={set("role")} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="INVENTORY_STAFF">Inventory Staff</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {loading ? "Creating…" : "Create user"}
          </button>
        </form>
      </div>

      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <h2 className="text-lg font-medium text-slate-700 mb-4">All Users</h2>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Username", "Email", "Role", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersList.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No users found.</td></tr>
            ) : (
              usersList.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.username}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "ADMINISTRATOR" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === user.id}
                      className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
