"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { users as usersApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const EMPTY = { firstName: "", lastName: "", username: "", email: "", password: "", role: "ADMINISTRATOR" };

const inputCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-2 focus:outline-[var(--accent)] transition-colors";
const selectCls = "rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] focus:outline-2 focus:outline-[var(--accent)] transition-colors";

export default function RegisterPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/warehouses");
  }, [authLoading, user, router]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await usersApi.create(form);
      await login(form.username, form.password);
      router.replace("/warehouses");
    } catch (err) {
      setError(err.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg)]">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 flex-col justify-between p-12">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-slate-900/30 blur-3xl" />
        <div className="absolute top-1/3 right-10 w-64 h-64 rounded-full bg-emerald-300/10 blur-2xl" />

        <div className="relative flex items-center gap-2 text-white">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Boxes size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">SmartlySort</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Take control of your inventory.
          </h1>
          <p className="text-emerald-50/80 text-lg max-w-md">
            Track stock, manage warehouses, and coordinate shipments — all in one place.
          </p>
        </div>

        <p className="relative text-xs text-emerald-50/60">
          &copy; {new Date().getFullYear()} SmartlySort
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-start mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center mb-4">
              <Boxes size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--fg)]">SmartlySort</h1>
          </div>

          <h2 className="text-2xl font-bold text-[var(--fg)] mb-1">Create your account</h2>
          <p className="text-sm text-[var(--muted-fg)] mb-6">Get started managing your inventory</p>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--fg)]">First name</label>
                <input
                  className={inputCls}
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                  autoFocus
                  placeholder="John"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--fg)]">Last name</label>
                <input
                  className={inputCls}
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Username</label>
              <input
                className={inputCls}
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                required
                placeholder="johndoe"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Email</label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                placeholder="john@company.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Password</label>
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--fg)]">Role</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)} className={selectCls}>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="INVENTORY_STAFF">Inventory Staff</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="mt-1 w-full justify-center py-2.5">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-[var(--muted-fg)] text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
