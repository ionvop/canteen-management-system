import type { ReactNode } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RoleNav from "@/components/navigation/RoleNav";
import { Button } from "@/components/ui/button";

const AppShell = ({ title, children }: { title: string; children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-card">
        <div className="container py-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Canteen Management System • Signed in as {user.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm bg-background">
                <UserCircle2 className="h-4 w-4 text-primary" />
                {user.name}
              </span>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => logout().then(() => navigate("/login"))}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <RoleNav role={user.role} />
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
};

export default AppShell;