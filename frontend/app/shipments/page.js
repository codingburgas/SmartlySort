"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { products as productsApi, suppliers as suppliersApi, shipments as shipmentsApi } from "@/lib/api";

const EMPTY = { supplierId: "", productId: "", quantity: "", reference: "" };

export default function ShipmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [suppliersList, setSuppliersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [shipmentsList, setShipmentsList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) {
      suppliersApi.list().then(setSuppliersList).catch((e) => setError(e.message));
      productsApi.list().then(setProductsList).catch((e) => setError(e.message));
      loadShipments();
    }
  }, [authLoading, user]);

  async function loadShipments() {
    try {
      const data = await shipmentsApi.list();
      setShipmentsList(data);
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
      await shipmentsApi.receive({
        supplierId: parseInt(form.supplierId, 10),
        productId: parseInt(form.productId, 10),
        quantity: parseInt(form.quantity, 10),
        reference: form.reference,
      });
      setForm(EMPTY);
      await loadShipments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Shipments</h1>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8 max-w-lg">
        <h2 className="text-lg font-medium text-slate-700 mb-4">Receive Shipment</h2>
        {formError && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Supplier</label>
            <select value={form.supplierId} onChange={set("supplierId")} required className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select supplier…</option>
              {suppliersList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Product</label>
            <select value={form.productId} onChange={set("productId")} required className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select product…</option>
              {productsList.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Quantity</label>
            <input type="number" min="1" value={form.quantity} onChange={set("quantity")} required className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Reference</label>
            <input type="text" value={form.reference} onChange={set("reference")} className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors">
            {loading ? "Receiving…" : "Receive shipment"}
          </button>
        </form>
      </div>

      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <h2 className="text-lg font-medium text-slate-700 mb-4">Shipment History</h2>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["ID", "Supplier", "Product", "Qty", "Reference"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipmentsList.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No shipments yet.</td></tr>
            ) : (
              shipmentsList.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{s.id}</td>
                  <td className="px-4 py-3 text-slate-800">{s.supplier?.name ?? s.supplierId}</td>
                  <td className="px-4 py-3 text-slate-700">{s.product?.name ?? s.productId}</td>
                  <td className="px-4 py-3 text-slate-700">{s.quantity}</td>
                  <td className="px-4 py-3 text-slate-500">{s.reference}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
