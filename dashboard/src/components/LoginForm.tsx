import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ChevronDown } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<
    "manager" | "associate" | null
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error(error);
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setEmailError("invalid");
    }
    setIsLoading(false);
  };

  const signInAsDemo = async (role: "manager" | "associate") => {
    setDemoError(null);
    setDemoLoading(role);
    const demoEmail =
      role === "manager"
        ? "demo.manager@citygo.com"
        : "demo.associate@citygo.com";
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: "CityGoDemo2026",
    });
    if (error) setDemoError(error.message);
    setDemoLoading(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to CityGo</CardTitle>
          <CardDescription>Sign in to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={signInWithGoogle}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">try a demo account</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => signInAsDemo("manager")}
              disabled={!!demoLoading}
              className="flex flex-col h-auto py-3 gap-1"
            >
              {demoLoading === "manager" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="text-sm font-semibold">Manager</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Full access
                  </span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => signInAsDemo("associate")}
              disabled={!!demoLoading}
              className="flex flex-col h-auto py-3 gap-1"
            >
              {demoLoading === "associate" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span className="text-sm font-semibold">Associate</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Guide access
                  </span>
                </>
              )}
            </Button>
          </div>

          {demoError && (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
              <span className="text-amber-500 text-sm mt-0.5">⚠</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                Demo login failed. Please try again or contact the
                administrator.
              </p>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setShowEmailForm((p) => !p);
                setEmailError(null);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <span>Sign in with email</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  showEmailForm ? "rotate-180" : ""
                }`}
              />
            </button>

            {showEmailForm && (
              <form onSubmit={signInWithEmail} className="space-y-3 mt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    required
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setEmailError(null);
                    }}
                    required
                    className="h-8 text-sm"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Staff accounts are provisioned by an administrator.
                </p>

                {emailError && (
                  <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                    <span className="text-amber-500 text-sm mt-0.5">⚠</span>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      No account found with these credentials. Staff accounts
                      are created by an administrator — try a demo account above
                      or sign in with Google.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  )}
                  Sign In
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
