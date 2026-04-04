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
import { Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CORRECT_PIN = "09186114";
const SESSION_KEY = "admin_authenticated";
const ADMIN_TOKEN_KEY = "caffeineAdminToken";

function dispatchAdminTokenChanged() {
  window.dispatchEvent(new CustomEvent("adminTokenChanged"));
}

export default function PINAuthGuard({
  children,
}: { children: React.ReactNode }) {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored === "true") {
        if (!sessionStorage.getItem(ADMIN_TOKEN_KEY)) {
          sessionStorage.setItem(ADMIN_TOKEN_KEY, CORRECT_PIN);
        }
        setIsAuthenticated(true);
        // Token already in sessionStorage — notify useActor
        dispatchAdminTokenChanged();
      }
    } catch (error) {
      console.error("Error reading sessionStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin === CORRECT_PIN) {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
        sessionStorage.setItem(ADMIN_TOKEN_KEY, CORRECT_PIN);
      } catch (error) {
        console.error("Error writing to sessionStorage:", error);
      }

      // Dispatch event — useActor will detect the new token and recreate the actor
      dispatchAdminTokenChanged();

      setIsAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Invalid PIN. Access denied.");
      setPin("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="w-full max-w-md border-border/60 bg-card/80 backdrop-blur shadow-2xl">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 border border-primary/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
              <CardDescription className="text-base">
                Enter your PIN to access the admin panel
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium">
                  PIN Code
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 8-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-xl tracking-[0.4em] h-12 rounded-xl border-border/60 focus:border-primary/60"
                  maxLength={8}
                  autoFocus
                  data-ocid="admin.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold gap-2 text-base"
                size="lg"
                data-ocid="admin.submit_button"
              >
                <Shield className="h-5 w-5" />
                Unlock Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
