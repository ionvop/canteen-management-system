import { NavLink } from "react-router-dom";
import type { Role } from "@/types/api";
import { cn } from "@/lib/utils";

const baseLinks = [{ label: "Dashboard", path: "/" }, { label: "Menu", path: "/menu" }];

const roleLinks: Record<Role, Array<{ label: string; path: string }>> = {
  admin: [
    { label: "POS", path: "/cashier/pos" },
    { label: "Admin Panel", path: "/admin/menu" },
    { label: "Reports", path: "/admin/reports" },
    { label: "Order Tracking", path: "/orders/tracking" },
  ],
  cashier: [
    { label: "POS", path: "/cashier/pos" },
    { label: "Order Tracking", path: "/orders/tracking" },
  ],
  customer: [{ label: "Order Tracking", path: "/orders/tracking" }],
};

const RoleNav = ({ role }: { role: Role }) => {
  const links = [...baseLinks, ...roleLinks[role]];

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => (
        <NavLink
          key={`${role}-${link.path}`}
          to={link.path}
          className={({ isActive }) =>
            cn(
              "px-3 py-2 text-sm rounded-xl transition-colors border",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-accent",
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default RoleNav;