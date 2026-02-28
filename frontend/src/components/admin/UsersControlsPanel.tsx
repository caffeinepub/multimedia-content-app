import React, { useState } from 'react';
import { Users, Wrench, Search, ShieldX, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  useGetAllUsers,
  useGetMaintenanceMode,
  useSetMaintenanceMode,
  useBlockUser,
  useUnblockUser,
} from '@/hooks/useQueries';
import { useAdminActor } from '@/hooks/useAdminActor';
import type { UserRecord } from '../../backend';

export default function UsersControlsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: UserRecord | null;
    action: 'block' | 'unblock';
  }>({ open: false, user: null, action: 'block' });
  const [localMaintenance, setLocalMaintenance] = useState<boolean | null>(null);

  // Check admin actor readiness (now delegates to useActor)
  const { actor: adminActor, isFetching: adminActorLoading } = useAdminActor();

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers();

  const {
    data: maintenanceMode = false,
    isLoading: maintenanceLoading,
  } = useGetMaintenanceMode();

  const setMaintenanceMode = useSetMaintenanceMode();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const effectiveMaintenance = localMaintenance !== null ? localMaintenance : maintenanceMode;

  // Show loading state while actor is initializing
  if (adminActorLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Initializing admin access…</p>
      </div>
    );
  }

  // Show error if actor failed to initialize
  if (!adminActor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Users className="w-10 h-10 text-destructive/60" />
        <p className="text-sm text-destructive font-medium text-center px-4">
          Admin access unavailable. Please reload the page and enter your PIN again.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload
        </Button>
      </div>
    );
  }

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setLocalMaintenance(enabled);
    try {
      await setMaintenanceMode.mutateAsync(enabled);
    } catch (err: unknown) {
      setLocalMaintenance(!enabled);
      const message =
        err instanceof Error ? err.message : 'Failed to update maintenance mode. Please try again.';
      toast.error(message);
    }
  };

  const handleBlockUnblock = async () => {
    if (!confirmDialog.user) return;
    const { user, action } = confirmDialog;
    setConfirmDialog({ open: false, user: null, action: 'block' });

    try {
      if (action === 'block') {
        await blockUser.mutateAsync(user.uniqueCode);
        toast.success(`User ${user.name} has been blocked.`);
      } else {
        await unblockUser.mutateAsync(user.uniqueCode);
        toast.success(`User ${user.name} has been unblocked.`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : action === 'block'
          ? 'Failed to block user. Please try again.'
          : 'Failed to unblock user. Please try again.';
      toast.error(message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Maintenance Mode Card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Wrench className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Maintenance Mode</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          When enabled, all users will see a maintenance screen instead of the app.
        </p>
        {maintenanceLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Switch
              checked={effectiveMaintenance}
              onCheckedChange={handleMaintenanceToggle}
              disabled={setMaintenanceMode.isPending}
            />
            {setMaintenanceMode.isPending ? (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…
              </span>
            ) : effectiveMaintenance ? (
              <span className="text-sm font-medium text-destructive">Maintenance Active</span>
            ) : (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">App is Live</span>
            )}
          </div>
        )}
      </div>

      {/* Registered Users Card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Registered Users</h2>
          {!usersLoading && !usersError && (
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {users.length} total
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Unique ID or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Users list */}
        {usersLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading users…</p>
          </div>
        ) : usersError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Users className="w-10 h-10 text-destructive/40" />
            <p className="text-sm text-destructive font-medium text-center">
              Failed to load users. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchUsers()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Users className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No users match your search.' : 'No registered users yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.uniqueCode}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background border border-border"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                    {user.isBlocked && (
                      <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                        Blocked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">{user.uniqueCode}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{user.server}</span>
                  </div>
                </div>
                <Button
                  variant={user.isBlocked ? 'outline' : 'destructive'}
                  size="sm"
                  className="shrink-0 text-xs h-8 px-3"
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      user,
                      action: user.isBlocked ? 'unblock' : 'block',
                    })
                  }
                  disabled={blockUser.isPending || unblockUser.isPending}
                >
                  {user.isBlocked ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Unblock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ShieldX className="w-3.5 h-3.5" /> Block
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Block/Unblock Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, user: null, action: 'block' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'block' ? 'Block User' : 'Unblock User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'block'
                ? `Are you sure you want to block ${confirmDialog.user?.name}? They will no longer be able to access the app.`
                : `Are you sure you want to unblock ${confirmDialog.user?.name}? They will regain access to the app.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUnblock}
              className={
                confirmDialog.action === 'block'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {confirmDialog.action === 'block' ? 'Block' : 'Unblock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
