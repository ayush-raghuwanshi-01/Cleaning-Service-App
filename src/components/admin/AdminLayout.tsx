import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListOrdered,
  Settings,
  PlusCircle,
  Sparkles,
  Menu,
  X,
  Users,
  UserCog,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/config";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/new", label: "Add order", icon: PlusCircle },
  { to: "/admin/catalog", label: "Catalog", icon: Settings },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit-log", label: "Audit Log", icon: ClipboardList },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">
                {BRAND_NAME}
              </p>
              <p className="text-[11px] text-muted-foreground">Admin</p>
            </div>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 text-xs text-muted-foreground">
            {user?.full_name}
          </p>
          <button
            onClick={logout}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background p-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-sm font-bold">{BRAND_NAME}</span>
        </div>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}