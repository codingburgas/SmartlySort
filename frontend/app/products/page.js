"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, Package, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import { products as productsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SkeletonTable } from "@/components/ui/Skeleton";

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentWarehouse, loading: whLoading } = useWarehouse();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !whLoading && !currentWarehouse) router.replace("/warehouses");
  }, [authLoading, user, whLoading, currentWarehouse, router]);

  useEffect(() => {
    if (user && currentWarehouse) load();
  }, [user, currentWarehouse]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await productsApi.list(currentWarehouse.id);
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = search.trim()
        ? await productsApi.search(currentWarehouse.id, search.trim())
        : await productsApi.list(currentWarehouse.id);
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
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

  if (authLoading || !user || whLoading) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Products</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">{currentWarehouse?.name}</p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus size={16} />
            Add Product
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)]"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
        {search && (
          <Button type="button" variant="ghost" onClick={() => { setSearch(""); load(); }}>
            <X size={14} />
          </Button>
        )}
      </form>

      {error && <div className="text-sm text-[var(--destructive)]">{error}</div>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-5">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={40} className="text-[var(--border)] mb-3" />
            <p className="font-semibold text-[var(--fg)]">No products found</p>
            <p className="text-sm text-[var(--muted-fg)] mt-1 mb-4">Add your first product to this warehouse</p>
            <Link href="/products/new"><Button size="sm"><Plus size={14} />Add Product</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  {["Name", "SKU", "Category", "Price", "Qty", "Min", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((p) => {
                  const low = p.quantity <= p.minStockLevel;
                  return (
                    <tr key={p.id} className="hover:bg-[var(--muted)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--fg)]">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted-fg)]">{p.sku}</td>
                      <td className="px-4 py-3 text-[var(--muted-fg)]">{p.category}</td>
                      <td className="px-4 py-3 font-mono text-[var(--fg)]">${p.price?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-semibold ${low ? "text-amber-600 dark:text-amber-400" : "text-[var(--fg)]"}`}>
                          {p.quantity}
                        </span>
                        {low && (
                          <Badge variant="warning" className="ml-2">Low</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[var(--muted-fg)]">{p.minStockLevel}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/products/${p.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil size={13} />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
