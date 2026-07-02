"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { products as productsApi } from "@/lib/api";

const EMPTY = { name: "", sku: "", price: "", quantity: "", category: "", minStockLevel: "" };

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) return <p className="p-6 text-gray-500">Loading…</p>;

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await productsApi.create({
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        minStockLevel: parseInt(form.minStockLevel, 10),
      });
      router.push("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">New Product</h1>
      {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
        {[
          { label: "Name", field: "name", type: "text" },
          { label: "SKU", field: "sku", type: "text" },
          { label: "Category", field: "category", type: "text" },
          { label: "Price", field: "price", type: "number" },
          { label: "Quantity", field: "quantity", type: "number" },
          { label: "Min Stock Level", field: "minStockLevel", type: "number" },
        ].map(({ label, field, type }) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
              type={type}
              value={form[field]}
              onChange={set(field)}
              required
              step={field === "price" ? "0.01" : undefined}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving…" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
