import { useState, type FormEvent } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Navbar } from "@/components/navigation/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type Flow = "signIn" | "signUp";

function friendly(err: unknown, flow: Flow): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/allowlist/i.test(raw)) return "This email is not on the allowlist.";
  if (/valid email/i.test(raw)) return "Enter a valid email address.";
  if (/InvalidSecret|InvalidAccountId|Invalid password/i.test(raw)) return "Wrong email or password.";
  if (/already exists/i.test(raw)) return "An account with this email already exists. Sign in instead.";
  if (/password/i.test(raw) && flow === "signUp") return "Password must be at least 8 characters.";
  return flow === "signIn" ? "Could not sign in. Check your email and password." : "Could not create the account.";
}

/** Email + password. Sign-up only works for allowlisted emails. */
export function SignInPage() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<Flow>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(friendly(err, flow));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="cyber-glass-glow w-full max-w-sm rounded-3xl border border-cyan-500/30 p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {flow === "signIn" ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-slate-400">
              {flow === "signIn" ? "Sign in to see your lists." : "Only emails on the allowlist can sign up."}
            </p>
          </div>
          <form onSubmit={submit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                  required
                />
              </Field>
              {error && (
                <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10">
                  <AlertDescription className="text-rose-300">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" variant="cyber" size="lg" disabled={busy}>
                {busy && <Spinner />}
                {flow === "signIn" ? "Sign in" : "Create account"}
              </Button>
              <button
                type="button"
                className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline"
                onClick={() => {
                  setFlow(flow === "signIn" ? "signUp" : "signIn");
                  setError(null);
                }}
              >
                {flow === "signIn" ? "First time? Create your account" : "Already have an account? Sign in"}
              </button>
            </FieldGroup>
          </form>
        </div>
      </main>
    </div>
  );
}
