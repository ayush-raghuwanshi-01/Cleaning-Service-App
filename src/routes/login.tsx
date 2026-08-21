import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { loginSchema, normalizePhone, zodFieldErrors } from "@/lib/validation";
import { ApiError } from "@/lib/api";
import { SUPPORT_PHONE, formatPhone } from "@/lib/config";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      // Users usually log in with phone — normalize 10-digit input to 91… so it
      // matches the registered format.
      const ident = normalizePhone(parsed.data.identifier) || parsed.data.identifier;
      const user = await login(ident, parsed.data.password);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`);
      navigate({ to: user.role === "CUSTOMER" ? "/orders" : "/admin" });
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? "Incorrect phone/email or password."
          : err instanceof ApiError
            ? err.message
            : "Login failed. Please try again.";
      setErrors({ _: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="identifier">Phone or email</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="9876543210"
                autoComplete="username"
                aria-invalid={Boolean(errors.identifier)}
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-destructive">{errors.identifier}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            {errors._ && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors._}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Spinner /> : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Trouble logging in? Call us at{" "}
            <a href={`tel:+${SUPPORT_PHONE}`} className="font-semibold text-primary">
              {formatPhone(SUPPORT_PHONE)}
            </a>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
