import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./BrandMark";
import { ThemeProvider } from "./providers/theme-provider";

/** Shown while the login and role are checked. Themed, so it never flashes white. */
export function LoadingScreen() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-foreground">
        <BrandMark className="size-10 text-base" />
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        {slow && (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <p>This is taking longer than usual.</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
