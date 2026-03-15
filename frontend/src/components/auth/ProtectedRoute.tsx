import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProtectedRouteProps = {
  allowedRoles?: Role[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-muted/20 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Access restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your role does not have access to this page.
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;