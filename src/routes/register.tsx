import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from "@/components/ui";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ full_name: fullName, phone, password });
      // Registration does not issue tokens; log in right after.
      await login(phone, password);
      navigate({ to: "/orders" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader><CardTitle className="text-center">Create your account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" maxLength={10} required />
            </div>
            <div>
              <Label htmlFor="password">Password (min 12 chars)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
