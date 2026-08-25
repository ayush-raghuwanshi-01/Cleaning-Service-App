import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { registerSchema, zodFieldErrors, normalizePhone } from "@/lib/validation";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ full_name: fullName, phone, password });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    const normalizedPhone = normalizePhone(parsed.data.phone);
    try {
      await register({
        full_name: parsed.data.full_name,
        phone: normalizedPhone,
        password: parsed.data.password,
      });
    } catch (err) {
      // Registration itself failed — surface the server's reason.
      const msg =
        err instanceof ApiError && err.status === 409
          ? "This mobile number is already registered. Try logging in instead."
          : err instanceof ApiError
            ? err.message
            : "Registration failed. Please try again.";
      setErrors({ _: msg });
      setLoading(false);
      return;
    }

    // Account exists now. Signing in is a separate step so a hiccup here never
    // shows a misleading "registration failed" message.
    try {
      await login(normalizedPhone, parsed.data.password);
      toast.success("Account created!", "You're all set — book your first clean.");
      navigate({ to: "/", search: { service: undefined, book: true } });
    } catch {
      toast.info(
        "Account created — please log in",
        "We couldn't sign you in automatically. Use the number and password you just set.",
      );
      navigate({ to: "/login" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Create your account</CardTitle>
          <p className="text-center text-xs text-muted-foreground">
            30 seconds — no email needed. Track bookings and re-book in one tap.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                autoComplete="name"
                aria-invalid={Boolean(errors.full_name)}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-destructive">{errors.full_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <div className="flex">
                <span className="grid h-10 place-items-center rounded-l-lg border border-r-0 border-input bg-secondary px-3 text-sm font-semibold text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  autoComplete="tel-national"
                  className="rounded-l-none"
                  aria-invalid={Boolean(errors.phone)}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password (min 12 characters)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Use a phrase you'll remember, e.g. ilovecleanhomes"
                autoComplete="new-password"
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
              {loading ? <Spinner /> : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
