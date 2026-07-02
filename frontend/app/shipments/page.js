"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ship, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import { products as productsApi, suppliers as suppliersApi, shipments as shipmentsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonTable } from "@/components/ui/Skeleton";

const EMPTY = { supplierId: "", productId: "", quantity: "", reference: "" };

const selectCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)]";
const inputCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)]";

export default function ShipmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentWarehouse, loading: whLoading } = useWarehouse();
  const router = useRouter();
  const [suppliersList, setSuppliersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [shipmentsList, setShipmentsList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !whLoading && !currentWarehouse) router.replace("/warehouses");
  }, [authLoading, user, whLoading, currentWarehouse, router]);

  useEffect(() => {
    if (user && currentWarehouse) {
      suppliersApi.list().then(setSuppliersList).catch((e) => setError(e.message));
      productsApi.list(currentWarehouse.id).then(setProductsList).catch((e) => setError(e.message));
      loadShipments();
    }
  }, [user, currentWarehouse]);

  async function loadShipments() {
    setTableLoading(true);
    try {
      const data = await shipmentsApi.list(currentWarehouse.id);
      setShipmentsList(data || []);
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
      await shipmentsApi.receive({
        supplierId: parseInt(form.supplierId),
        productId: parseInt(form.productId),
        quantity: parseInt(form.quantity),
        reference: form.reference,
        warehouseId: currentWarehouse.id,
      });
      setForm(EMPTY);
      await loadShipments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user || whLoading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Shipments</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">{currentWarehouse?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="text-base font-semibold text-[var(--fg)] mb-4">Receive Shipment</h2>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Supplier</label>
              <select value={form.supplierId} onChange={(e) => set("supplierId", e.target.value)} required className={selectCls}>
                <option value="">Select supplier…</option>
                {suppliersList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Product</label>
              <select value={form.productId} onChange={(e) => set("productId", e.target.value)} required className={selectCls}>
                <option value="">Select product…</option>
                {productsList.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required className={inputCls} placeholder="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Reference</label>
              <input type="text" value={form.reference} onChange={(e) => set("reference", e.target.value)} className={inputCls} placeholder="PO-0001" />
            </div>
            <Button type="submit" disabled={loading} className="justify-center">
              {loading ? "Receiving…" : "Receive Shipment"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold text-[var(--fg)]">Shipment History</h2>
          {error && <div className="text-sm text-[var(--destructive)]">{error}</div>}
          <Card className="overflow-hidden">
            {tableLoading ? (
              <div className="p-5"><SkeletonTable rows={5} cols={5} /></div>
            ) : shipmentsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Ship size={40} className="text-[var(--border)] mb-3" />
                <p className="font-semibold text-[var(--fg)]">No shipments yet</p>
                <p className="text-sm text-[var(--muted-fg)] mt-1">Receive your first shipment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                    <tr>
                      {["#", "Supplier", "Product", "Qty", "Reference"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {shipmentsList.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--muted)] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[var(--muted-fg)]">{s.id}</td>
                        <td className="px-4 py-3 font-medium text-[var(--fg)]">{s.supplier?.name ?? s.supplierId}</td>
                        <td className="px-4 py-3 text-[var(--fg)]">{s.product?.name ?? s.productId}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-[var(--fg)]">{s.quantity}</td>
                        <td className="px-4 py-3 text-[var(--muted-fg)]">{s.reference || "—"}</td>
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
