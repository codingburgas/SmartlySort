"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, BarChart2, AlertTriangle, Truck } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import { products as productsApi, stock as stockApi, suppliers as suppliersApi } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const DashboardCharts = dynamic(() => import("@/components/DashboardCharts"), { ssr: false, loading: () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {[0,1,2].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
  </div>
)});

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentWarehouse, loading: whLoading } = useWarehouse();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [supplierCount, setSupplierCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !whLoading && !currentWarehouse) {
      router.replace("/warehouses");
    }
  }, [authLoading, user, whLoading, currentWarehouse, router]);

  useEffect(() => {
    if (user && currentWarehouse) {
      loadData();
    }
  }, [user, currentWarehouse]);

  async function loadData() {
    setLoading(true);
    try {
      const [prods, movs, sups] = await Promise.all([
        productsApi.list(currentWarehouse.id),
        stockApi.list(currentWarehouse.id),
        suppliersApi.list(),
      ]);
      setProducts(prods || []);
      setMovements(movs || []);
      setSupplierCount((sups || []).length);
    } catch {}
    setLoading(false);
  }

  if (authLoading || whLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!currentWarehouse) return null;

  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const lowStockCount = products.filter((p) => p.quantity <= p.minStockLevel).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">
          {currentWarehouse.name}
        </h1>
        <p className="text-sm text-[var(--muted-fg)] mt-1">
          Welcome back, {user.firstName} — here is your warehouse overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} icon={Package} loading={loading} />
        <StatCard label="Total Units" value={totalUnits.toLocaleString()} icon={BarChart2} loading={loading} accent />
        <StatCard label="Low Stock" value={lowStockCount} icon={AlertTriangle} loading={loading} />
        <StatCard label="Suppliers" value={supplierCount} icon={Truck} loading={loading} />
      </div>

      {!loading && products.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <Package size={48} className="text-[var(--border)] mb-3" />
          <p className="text-lg font-semibold text-[var(--fg)]">No data yet</p>
          <p className="text-sm text-[var(--muted-fg)] mt-1">Add products to see your dashboard analytics</p>
        </Card>
      ) : (
        <DashboardCharts products={products} movements={movements} loading={loading} />
      )}
    </div>
  );
}
