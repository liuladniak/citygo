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
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error(error);
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError("Invalid email or password");
    setIsLoading(false);
  };

  const signInAsDemo = async (role: "manager" | "associate") => {
    setError(null);
    setIsLoading(true);
    const demoEmail =
      role === "manager"
        ? "demo.manager@citygo.com"
        : "demo.associate@citygo.com";
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: "CityGoDemo2026",
    });
    if (error) {
      console.error("Full error:", error.message, error.status, error);
      setError(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to CityGo</CardTitle>
          <CardDescription>Sign in to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={signInWithEmail} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">or continue with</span>
            </div>
          </div>

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
              disabled={isLoading}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <span className="text-sm font-semibold">Manager</span>
              <span className="text-xs text-muted-foreground font-normal">
                Full access
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => signInAsDemo("associate")}
              disabled={isLoading}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <span className="text-sm font-semibold">Associate</span>
              <span className="text-xs text-muted-foreground font-normal">
                Guide access
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
