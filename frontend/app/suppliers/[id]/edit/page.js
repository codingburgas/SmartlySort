"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { suppliers as suppliersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const inputCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)]";

export default function EditSupplierPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) {
      suppliersApi.get(id).then((s) => {
        setForm({ name: s.name ?? "", contactEmail: s.contactEmail ?? "", phone: s.phone ?? "" });
      }).catch((e) => setError(e.message));
    }
  }, [id, authLoading, user]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await suppliersApi.update(id, form);
      router.push("/suppliers");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/suppliers">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Edit Supplier</h1>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {!form ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Contact Email</label>
              <input type="email" className={inputCls} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Phone</label>
              <input type="tel" className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/suppliers" className="flex-1">
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
