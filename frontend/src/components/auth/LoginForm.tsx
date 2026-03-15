import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!emailRegex.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    login(email, password)
      .then(() => {
        const from = (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname;
        navigate(from || "/", { replace: true });
      })
      .catch((error: Error) => showError(error.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-primary/20 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-primary">Secure Login</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign in to access your role-based dashboard.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-9 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-9 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;