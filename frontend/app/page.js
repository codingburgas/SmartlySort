"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, BarChart2, DollarSign, AlertTriangle, Truck, Ship } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import {
  products as productsApi,
  stock as stockApi,
  suppliers as suppliersApi,
  shipments as shipmentsApi,
  warehouses as warehousesApi,
} from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { LowStockWidget } from "@/components/dashboard/LowStockWidget";
import { ShipmentsWidget } from "@/components/dashboard/ShipmentsWidget";
import { ActivityWidget } from "@/components/dashboard/ActivityWidget";
import { TeamWidget } from "@/components/dashboard/TeamWidget";
import { TopProductsWidget } from "@/components/dashboard/TopProductsWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { formatCurrency } from "@/components/dashboard/widgetUtils";

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
  const [suppliersList, setSuppliersList] = useState([]);
  const [shipmentsList, setShipmentsList] = useState([]);
  const [members, setMembers] = useState([]);
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
      const [prods, movs, sups, ships, mems] = await Promise.all([
        productsApi.list(currentWarehouse.id),
        stockApi.list(currentWarehouse.id),
        suppliersApi.list(),
        shipmentsApi.list(currentWarehouse.id),
        warehousesApi.listMembers(currentWarehouse.id),
      ]);
      setProducts(prods || []);
      setMovements(movs || []);
      setSuppliersList(sups || []);
      setShipmentsList(ships || []);
      setMembers(mems || []);
    } catch {}
    setLoading(false);
  }

  if (authLoading || whLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!currentWarehouse) return null;

  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const inventoryValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0);
  const lowStock = products.filter((p) => p.quantity <= p.minStockLevel);
  const openShipments = shipmentsList.filter((s) => (s.status ?? "DUE") !== "COMPLETED").length;

  const productMap = {};
  for (const p of products) productMap[p.id] = p.name;
  const supplierMap = {};
  for (const s of suppliersList) supplierMap[s.id] = s.name;

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

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Total Products" value={products.length} icon={Package} loading={loading} />
        <StatCard label="Total Units" value={totalUnits.toLocaleString()} icon={BarChart2} loading={loading} accent />
        <StatCard label="Inventory Value" value={formatCurrency(inventoryValue)} icon={DollarSign} loading={loading} accent />
        <StatCard label="Low Stock" value={lowStock.length} icon={AlertTriangle} loading={loading} />
        <StatCard label="Open Shipments" value={openShipments} icon={Ship} loading={loading} />
        <StatCard label="Suppliers" value={suppliersList.length} icon={Truck} loading={loading} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LowStockWidget loading={loading} lowStock={lowStock} />
        <ShipmentsWidget
          loading={loading}
          shipmentsList={shipmentsList}
          productMap={productMap}
          supplierMap={supplierMap}
        />
        <ActivityWidget loading={loading} movements={movements} productMap={productMap} />
        <TeamWidget loading={loading} members={members} user={user} currentWarehouse={currentWarehouse} />
        <TopProductsWidget loading={loading} products={products} />
        <QuickActionsWidget />
      </div>
    </div>
  );
}
