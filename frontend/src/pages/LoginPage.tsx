import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Server, User, ChevronRight, Wifi, AlertCircle } from 'lucide-react';
import { useRegisterUser } from '../hooks/useQueries';

const SERVERS = [
  { id: 'kashmir', label: 'V.99.kashmir.2HZ.World' },
  { id: 'ikhlas', label: 'Developer.99Hz/ikhlas.Java' },
];

/**
 * Generate a stable device fingerprint from browser properties.
 * Stored in localStorage under 'dmUser_deviceId'.
 */
function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem('dmUser_deviceId');
  if (stored) return stored;

  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency ?? 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform ?? '',
  ].join('|');

  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const deviceId = 'DID-' + Math.abs(hash).toString(16).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  localStorage.setItem('dmUser_deviceId', deviceId);
  return deviceId;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'name' | 'server'>('name');
  const [nameError, setNameError] = useState('');
  const [connectingServer, setConnectingServer] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState('');

  const registerUser = useRegisterUser();

  const handleConnect = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Please enter your name to continue.');
      return;
    }
    setNameError('');
    setStep('server');
  };

  const handleServerSelect = async (serverLabel: string) => {
    setConnectingServer(serverLabel);
    setRegisterError('');

    const deviceId = getOrCreateDeviceId();
    const trimmedName = name.trim();

    try {
      const uniqueCode = await registerUser.mutateAsync({
        name: trimmedName,
        server: serverLabel,
        deviceId,
      });

      localStorage.setItem('dmUser_name', trimmedName);
      localStorage.setItem('dmUser_server', serverLabel);
      localStorage.setItem('dmUser_uniqueCode', uniqueCode);

      navigate({ to: '/' });
    } catch (err: unknown) {
      const msg = (err as any)?.message || 'Registration failed. Please try again.';
      setRegisterError(msg);
      setConnectingServer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-8 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
        <img
          src="/assets/generated/dard-e-munasif-logo.dim_200x200.png"
          alt="Dard-e-munasif"
          className="h-20 w-20 rounded-full object-cover border-2 border-primary/30 shadow-lg shadow-primary/20"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent tracking-tight">
          Dard-e-munasif
        </h1>
        <p className="text-sm text-muted-foreground">Connect to experience poetry, dua & music</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5 p-8">

          {step === 'name' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
                <p className="text-sm text-muted-foreground">Enter your name to get started</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-input" className="text-sm font-medium text-foreground">
                  Enter Your Name
                </Label>
                <Input
                  id="name-input"
                  type="text"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="h-11 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 transition-colors"
                  autoFocus
                />
                {nameError && (
                  <p className="text-xs text-destructive animate-in fade-in duration-200">
                    {nameError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleConnect}
                className="w-full h-11 rounded-xl font-semibold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Wifi className="h-4 w-4" />
                Connect with Server
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'server' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Select a Server</h2>
                <p className="text-sm text-muted-foreground">
                  Hello <span className="font-medium text-foreground">{name.trim()}</span>, choose your server
                </p>
              </div>

              {registerError && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              <div className="space-y-3">
                {SERVERS.map((server) => {
                  const isConnecting = connectingServer === server.label;
                  return (
                    <button
                      key={server.id}
                      onClick={() => handleServerSelect(server.label)}
                      disabled={connectingServer !== null}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-background/60 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group text-left"
                    >
                      <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-colors ${isConnecting ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40 group-hover:bg-primary/60'}`} />
                      <span className="flex-1 text-sm font-medium text-foreground font-mono">
                        {server.label}
                      </span>
                      {isConnecting ? (
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { setStep('name'); setConnectingServer(null); setRegisterError(''); }}
                disabled={connectingServer !== null}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                ← Change name
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Built with <span className="text-red-400">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-muted-foreground/80"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
