"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Truck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  Ship,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import {
  shipments as shipmentsApi,
  suppliers as suppliersApi,
  products as productsApi,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUSES = ["DUE", "IN_PROGRESS", "COMPLETED"];

const COLUMN_META = {
  DUE: {
    label: "Due",
    icon: Clock,
    dotColor: "bg-amber-400",
    borderColor: "border-l-amber-400",
    badgeVariant: "warning",
    headerText: "text-amber-600 dark:text-amber-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Truck,
    dotColor: "bg-indigo-500",
    borderColor: "border-l-indigo-500",
    badgeVariant: "info",
    headerText: "text-indigo-600 dark:text-indigo-400",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    dotColor: "bg-emerald-500",
    borderColor: "border-l-emerald-500",
    badgeVariant: "success",
    headerText: "text-emerald-600 dark:text-emerald-400",
  },
};

const EMPTY_FORM = { supplierId: "", productId: "", quantity: "", reference: "" };

const inputCls =
  "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)] w-full";
const selectCls =
  "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)] w-full";

function NewShipmentModal({ suppliers, products, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await shipmentsApi.create({
        supplierId: parseInt(form.supplierId),
        productId: parseInt(form.productId),
        quantity: parseInt(form.quantity),
        reference: form.reference,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--fg)]">New Shipment</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-fg)] hover:text-[var(--fg)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg)]">Supplier</label>
            <select
              value={form.supplierId}
              onChange={(e) => set("supplierId", e.target.value)}
              required
              className={selectCls}
            >
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg)]">Product</label>
            <select
              value={form.productId}
              onChange={(e) => set("productId", e.target.value)}
              required
              className={selectCls}
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg)]">Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              required
              className={inputCls}
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--fg)]">Reference</label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => set("reference", e.target.value)}
              className={inputCls}
              placeholder="PO-0001"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 justify-center">
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ShipmentCard({ shipment, productName, supplierName, onMove, movingId }) {
  const statusIndex = STATUSES.indexOf(shipment.status);
  const meta = COLUMN_META[shipment.status];
  const isMoving = movingId === shipment.id;

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("shipmentId", String(shipment.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`p-3.5 border-l-4 ${meta.borderColor} cursor-grab active:cursor-grabbing active:scale-[1.02] active:shadow-md select-none ${
        isMoving ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-[var(--fg)] leading-snug">{productName}</p>
        <Badge variant={meta.badgeVariant} className="flex-shrink-0 text-[10px]">
          {meta.label}
        </Badge>
      </div>

      <p className="text-xs text-[var(--muted-fg)] mb-2">{supplierName}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-[var(--fg)]">
            {shipment.quantity}
          </span>
          {shipment.reference && (
            <span className="text-xs text-[var(--muted-fg)]">{shipment.reference}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(shipment.id, STATUSES[statusIndex - 1])}
            disabled={statusIndex === 0 || isMoving}
            title="Move left"
            className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-fg)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => onMove(shipment.id, STATUSES[statusIndex + 1])}
            disabled={statusIndex === STATUSES.length - 1 || isMoving}
            title="Move right"
            className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-fg)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({ status, shipments, productMap, supplierMap, onMove, movingId, onDrop }) {
  const meta = COLUMN_META[status];
  const Icon = meta.icon;
  const [dragOver, setDragOver] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const id = parseInt(e.dataTransfer.getData("shipmentId"));
    if (!isNaN(id)) onDrop(id, status);
  }

  return (
    <div
      className={`flex flex-col min-h-[400px] rounded-xl border transition-colors ${
        dragOver
          ? "border-[var(--accent)] bg-[var(--muted)]"
          : "border-[var(--border)] bg-[var(--bg)]"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dotColor}`} />
        <Icon size={15} className={meta.headerText} />
        <span className={`text-sm font-semibold ${meta.headerText}`}>{meta.label}</span>
        <Badge variant={meta.badgeVariant} className="ml-auto">
          {shipments.length}
        </Badge>
      </div>

      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        {shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Ship size={24} className="text-[var(--border)] mb-1.5" />
            <p className="text-xs text-[var(--muted-fg)]">No shipments</p>
          </div>
        ) : (
          shipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              productName={productMap[s.productId] ?? `#${s.productId}`}
              supplierName={supplierMap[s.supplierId] ?? `#${s.supplierId}`}
              onMove={onMove}
              movingId={movingId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATUSES.map((s) => (
        <div key={s} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 space-y-2.5 min-h-[300px]">
          <Skeleton className="h-6 w-32 mb-3" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ShipmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentWarehouse, loading: whLoading } = useWarehouse();
  const router = useRouter();

  const [shipmentsList, setShipmentsList] = useState([]);
  const [supplierMap, setSupplierMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [suppliersList, setSuppliersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movingId, setMovingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !whLoading && !currentWarehouse) router.replace("/warehouses");
  }, [authLoading, user, whLoading, currentWarehouse, router]);

  useEffect(() => {
    if (user && currentWarehouse) loadAll();
  }, [user, currentWarehouse]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [shipments, suppliers, products] = await Promise.all([
        shipmentsApi.list(currentWarehouse.id),
        suppliersApi.list(),
        productsApi.list(currentWarehouse.id),
      ]);
      setShipmentsList(shipments || []);
      setSuppliersList(suppliers || []);
      setProductsList(products || []);
      const sm = {};
      for (const s of suppliers || []) sm[s.id] = s.name;
      setSupplierMap(sm);
      const pm = {};
      for (const p of products || []) pm[p.id] = p.name;
      setProductMap(pm);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMove(id, newStatus) {
    if (!newStatus) return;
    setMovingId(id);
    setShipmentsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    try {
      await shipmentsApi.updateStatus(id, newStatus);
      const fresh = await shipmentsApi.list(currentWarehouse.id);
      setShipmentsList(fresh || []);
    } catch (e) {
      setError(e.message);
      const fresh = await shipmentsApi.list(currentWarehouse.id);
      setShipmentsList(fresh || []);
    } finally {
      setMovingId(null);
    }
  }

  function bucketed(status) {
    return shipmentsList.filter((s) => (s.status ?? "DUE") === status);
  }

  if (authLoading || !user || whLoading) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Shipments</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">{currentWarehouse?.name}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New Shipment
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {loading ? (
        <KanbanSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              shipments={bucketed(status)}
              productMap={productMap}
              supplierMap={supplierMap}
              onMove={handleMove}
              movingId={movingId}
              onDrop={handleMove}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewShipmentModal
          suppliers={suppliersList}
          products={productsList}
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            await loadAll();
          }}
        />
      )}
    </div>
  );
}
