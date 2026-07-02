"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const sections = [
  { href: "/products", label: "Products", desc: "Browse, search and manage your product catalog." },
  { href: "/stock", label: "Stock Movements", desc: "Record IN/OUT movements and view history." },
  { href: "/suppliers", label: "Suppliers", desc: "Manage supplier contacts and details." },
  { href: "/shipments", label: "Shipments", desc: "Receive shipments and auto-update stock." },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">
        Welcome, {user.firstName}
      </h1>
      <p className="text-slate-500 mb-8">Select a section to get started.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <h2 className="text-lg font-semibold text-indigo-700 mb-1">{label}</h2>
            <p className="text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
        {user.role === "ADMINISTRATOR" && (
          <Link
            href="/users"
            className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <h2 className="text-lg font-semibold text-indigo-700 mb-1">Users</h2>
            <p className="text-sm text-slate-500">Manage staff accounts and roles.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
