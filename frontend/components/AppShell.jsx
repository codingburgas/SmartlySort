"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Ship,
  BarChart3,
  Users,
  Warehouse,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  LogOut,
  SortAsc,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { useWarehouse } from "./WarehouseProvider";
import { products as productsApi } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/stock", label: "Stock", icon: ArrowLeftRight },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/shipments", label: "Shipments", icon: Ship },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

function NavLink({ href, label, icon: Icon, pathname, badge }) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
        isActive
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--muted)]"
      }`}
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="flex-shrink-0 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs font-semibold px-2 py-0.5">
          {badge}
        </span>
      )}
    </Link>
  );
}

function WarehouseSwitcher({ onClose }) {
  const { warehouses, currentWarehouse, selectWarehouse } = useWarehouse();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSelect(w) {
    selectWarehouse(w);
    setOpen(false);
    if (onClose) onClose();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--border)] text-sm font-medium text-[var(--fg)] cursor-pointer transition-colors"
      >
        <Warehouse size={16} className="text-[var(--accent)] flex-shrink-0" />
        <span className="truncate flex-1 text-left">
          {currentWarehouse ? currentWarehouse.name : "No warehouse"}
        </span>
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
          {warehouses.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                currentWarehouse?.id === w.id
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--fg)] hover:bg-[var(--muted)]"
              }`}
            >
              {w.name}
            </button>
          ))}
          <div className="border-t border-[var(--border)]">
            <button
              onClick={() => { router.push("/warehouses"); setOpen(false); if (onClose) onClose(); }}
              className="w-full text-left px-3 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--muted)] transition-colors cursor-pointer flex items-center gap-2"
            >
              <Warehouse size={14} />
              Manage warehouses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ pathname, onLinkClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentWarehouse } = useWarehouse();
  const router = useRouter();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (!currentWarehouse) {
      setLowStockCount(0);
      return;
    }
    let cancelled = false;
    productsApi
      .lowStock(currentWarehouse.id)
      .then((data) => {
        if (!cancelled) setLowStockCount((data || []).length);
      })
      .catch(() => {
        if (!cancelled) setLowStockCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [currentWarehouse]);

  const links = [...navLinks];
  if (user?.role === "ADMINISTRATOR") {
    links.push({ href: "/users", label: "Users", icon: Users });
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/" onClick={onLinkClick} className="flex items-center gap-2 text-[var(--fg)] no-underline">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <SortAsc size={18} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">SmartlySort</span>
        </Link>
      </div>

      <div className="p-3 border-b border-[var(--border)]">
        <WarehouseSwitcher onClose={onLinkClick} />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <div key={link.href} onClick={onLinkClick}>
            <NavLink {...link} pathname={pathname} badge={link.href === "/reports" ? lowStockCount : 0} />
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--border)] space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <div className="px-3 py-2">
          <p className="text-xs text-[var(--muted-fg)] truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-[var(--muted-fg)] truncate opacity-60">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)]">
        <SidebarContent pathname={pathname} onLinkClick={null} />
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transform transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-fg)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent pathname={pathname} onLinkClick={() => setDrawerOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-fg)] cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm">SmartlySort</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
