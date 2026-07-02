"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { products as productsApi } from "@/lib/api";

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    load();
  }, [user]);

  async function load() {
    try {
      const data = await productsApi.list();
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    try {
      const data = search.trim()
        ? await productsApi.search(search.trim())
        : await productsApi.list();
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await productsApi.remove(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
        <Link
          href="/products/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Add product
        </Link>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); load(); }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Clear
          </button>
        )}
      </form>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "SKU", "Category", "Price", "Qty", "Min Level", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No products found.</td></tr>
            ) : (
              items.map((p) => {
                const low = p.quantity <= p.minStockLevel;
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3 text-slate-600">{p.category}</td>
                    <td className="px-4 py-3 text-slate-600">${p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={low ? "text-red-600 font-semibold" : "text-slate-700"}>
                        {p.quantity}
                        {low && (
                          <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 font-medium">Low</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.minStockLevel}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
