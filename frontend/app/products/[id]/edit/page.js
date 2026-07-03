"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import { products as productsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const inputCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)]";

export default function EditProductPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentWarehouse, loading: whLoading } = useWarehouse();
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !whLoading && !currentWarehouse) router.replace("/warehouses");
  }, [authLoading, user, whLoading, currentWarehouse, router]);

  useEffect(() => {
    if (!authLoading && user) {
      productsApi.get(id).then((p) => {
        if (currentWarehouse && Number(p.warehouseId) !== Number(currentWarehouse.id)) {
          router.replace("/products");
          return;
        }
        setForm({
          name: p.name ?? "",
          sku: p.sku ?? "",
          price: p.price ?? "",
          quantity: p.quantity ?? "",
          category: p.category ?? "",
          minStockLevel: p.minStockLevel ?? "",
          warehouseId: p.warehouseId ?? currentWarehouse?.id,
        });
      }).catch((e) => setError(e.message));
    }
  }, [id, authLoading, user, currentWarehouse, router]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await productsApi.update(id, {
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        minStockLevel: parseInt(form.minStockLevel),
        warehouseId: form.warehouseId || currentWarehouse?.id,
      });
      router.push("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user || whLoading) return null;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Edit Product</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">{currentWarehouse?.name}</p>
        </div>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {!form ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Product Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">SKU</label>
              <input className={inputCls} value={form.sku} onChange={(e) => set("sku", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Category</label>
              <input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Price ($)</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Quantity</label>
              <input type="number" min="0" className={inputCls} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Min Stock Level</label>
              <input type="number" min="0" className={inputCls} value={form.minStockLevel} onChange={(e) => set("minStockLevel", e.target.value)} required />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Link href="/products" className="flex-1">
                <Button type="button" variant="outline" className="w-full justify-center">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 justify-center">
                {loading ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
