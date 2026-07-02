"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const links = [
    { href: "/products", label: "Products" },
    { href: "/stock", label: "Stock" },
    { href: "/suppliers", label: "Suppliers" },
    { href: "/shipments", label: "Shipments" },
  ];

  if (user.role === "ADMINISTRATOR") {
    links.push({ href: "/users", label: "Users" });
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight text-white">
            SmartlySort
          </Link>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-indigo-200 ${
                pathname.startsWith(href) ? "text-white underline underline-offset-4" : "text-indigo-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-indigo-200">
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
