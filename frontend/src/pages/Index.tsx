import { Link } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useAuth();

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are signed in as <span className="font-semibold capitalize">{user?.role}</span>.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-primary">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl">
              <Link to="/menu">Browse Menu</Link>
            </Button>
            {(user?.role === "cashier" || user?.role === "admin") && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/cashier/pos">Open POS</Link>
              </Button>
            )}
            {user?.role === "admin" && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/admin/reports">View Reports</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-primary">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/orders/tracking">Track Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Index;