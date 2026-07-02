"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { suppliers as suppliersApi } from "@/lib/api";

export default function SuppliersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user]);

  async function load() {
    try {
      const data = await suppliersApi.list();
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    try {
      const data = search.trim()
        ? await suppliersApi.search(search.trim())
        : await suppliersApi.list();
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this supplier?")) return;
    try {
      await suppliersApi.remove(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  if (authLoading || !user) return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Suppliers</h1>
        <Link
          href="/suppliers/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Add supplier
        </Link>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(""); load(); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            Clear
          </button>
        )}
      </form>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Email", "Phone", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No suppliers found.</td></tr>
            ) : (
              items.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.contactEmail}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/suppliers/${s.id}/edit`} className="rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(s.id)} className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
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
