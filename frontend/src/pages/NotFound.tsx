import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Oops! Page not found.</p>
        <a
          href="/"
          className="inline-flex rounded-xl border border-primary px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;