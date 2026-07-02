"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { products as productsApi, stock as stockApi } from "@/lib/api";

const EMPTY = { productId: "", type: "IN", quantity: "", reason: "" };

export default function StockPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [productsList, setProductsList] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) {
      productsApi.list().then(setProductsList).catch((e) => setError(e.message));
      loadMovements();
    }
  }, [authLoading, user]);

  async function loadMovements() {
    try {
      const data = await stockApi.list();
      setMovements(data);
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
      await stockApi.record({
        productId: parseInt(form.productId, 10),
        type: form.type,
        quantity: parseInt(form.quantity, 10),
        reason: form.reason,
      });
      setForm(EMPTY);
      await loadMovements();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Stock Movements</h1>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8 max-w-lg">
        <h2 className="text-lg font-medium text-slate-700 mb-4">Record Movement</h2>
        {formError && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Product</label>
            <select
              value={form.productId}
              onChange={set("productId")}
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select product…</option>
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <select
              value={form.type}
              onChange={set("type")}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={set("quantity")}
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Reason</label>
            <input
              type="text"
              value={form.reason}
              onChange={set("reason")}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "Recording…" : "Record movement"}
          </button>
        </form>
      </div>

      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <h2 className="text-lg font-medium text-slate-700 mb-4">History</h2>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["ID", "Product", "Type", "Quantity", "Reason"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No movements recorded.</td></tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{m.id}</td>
                  <td className="px-4 py-3 text-slate-800">{m.product?.name ?? m.productId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${m.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{m.quantity}</td>
                  <td className="px-4 py-3 text-slate-500">{m.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
