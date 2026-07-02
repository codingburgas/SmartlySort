"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { suppliers as suppliersApi } from "@/lib/api";

export default function EditSupplierPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    suppliersApi.get(id).then((s) => {
      setForm({ name: s.name ?? "", contactEmail: s.contactEmail ?? "", phone: s.phone ?? "" });
    }).catch((e) => setError(e.message));
  }, [id, user]);

  if (!user) return null;
  if (!form) return <div className="text-slate-500">Loading…</div>;

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await suppliersApi.update(id, form);
      router.push("/suppliers");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Edit Supplier</h1>
      {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
        {[
          { label: "Name", field: "name", type: "text" },
          { label: "Contact Email", field: "contactEmail", type: "email" },
          { label: "Phone", field: "phone", type: "text" },
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
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {loading ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={() => router.push("/suppliers")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
