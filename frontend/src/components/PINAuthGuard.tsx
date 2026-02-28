import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const CORRECT_PIN = '09186114';
const SESSION_KEY = 'admin_authenticated';
// Store the PIN as the admin token so useAdminActor can pick it up
const ADMIN_TOKEN_KEY = 'caffeineAdminToken';

export default function PINAuthGuard({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored === 'true') {
        // Ensure the admin token is also set (in case it was cleared)
        const existingToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
        if (!existingToken) {
          sessionStorage.setItem(ADMIN_TOKEN_KEY, CORRECT_PIN);
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error reading sessionStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin === CORRECT_PIN) {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
        // Store the PIN as the admin token for useAdminActor to use
        sessionStorage.setItem(ADMIN_TOKEN_KEY, CORRECT_PIN);
      } catch (error) {
        console.error('Error writing to sessionStorage:', error);
      }

      // Invalidate the cached actor so it gets re-created with the admin token
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      // Also clear any stale allUsers query so it re-runs with the new actor
      await queryClient.invalidateQueries({ queryKey: ['allUsers'] });

      setIsAuthenticated(true);
      toast.success('Access granted!');
    } else {
      toast.error('Invalid PIN. Access denied.');
      setPin('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter PIN to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  maxLength={8}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
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
