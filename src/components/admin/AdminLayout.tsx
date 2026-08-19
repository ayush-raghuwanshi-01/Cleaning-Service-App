import { Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ListOrdered, Settings, PlusCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered },
  { to: "/admin/new", label: "Add order", icon: PlusCircle },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">SparkleHome</p>
            <p className="text-[11px] text-muted-foreground">Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="px-3 text-xs text-muted-foreground">{user?.full_name}</p>
          <button
            onClick={logout}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
