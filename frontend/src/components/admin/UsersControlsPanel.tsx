import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Users, ShieldOff, ShieldCheck, Wrench } from 'lucide-react';
import {
  useGetMaintenanceMode,
  useSetMaintenanceMode,
  useGetAllUsers,
  useBlockUser,
  useUnblockUser,
} from '@/hooks/useQueries';

export default function UsersControlsPanel() {
  const [searchTerm, setSearchTerm] = useState('');

  // Maintenance mode
  const { data: maintenanceMode, isLoading: maintenanceLoading } = useGetMaintenanceMode();
  const setMaintenanceMutation = useSetMaintenanceMode();

  // Users
  const { data: users, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useGetAllUsers();

  // Block / Unblock mutations
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      await setMaintenanceMutation.mutateAsync(enabled);
      toast.success(enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    } catch (err: any) {
      toast.error('Failed to update maintenance mode: ' + (err?.message ?? 'Unknown error'));
    }
  };

  const handleBlock = async (uniqueCode: string) => {
    try {
      await blockMutation.mutateAsync(uniqueCode);
      toast.success(`User ${uniqueCode} has been blocked`);
    } catch (err: any) {
      toast.error('Failed to block user: ' + (err?.message ?? 'Unknown error'));
    }
  };

  const handleUnblock = async (uniqueCode: string) => {
    try {
      await unblockMutation.mutateAsync(uniqueCode);
      toast.success(`User ${uniqueCode} has been unblocked`);
    } catch (err: any) {
      toast.error('Failed to unblock user: ' + (err?.message ?? 'Unknown error'));
    }
  };

  // Client-side filter by unique code
  const filteredUsers = (users ?? []).filter((u) =>
    u.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Maintenance Mode Toggle */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Maintenance Mode</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          When enabled, all users will see a maintenance screen instead of the app.
        </p>
        <div className="flex items-center gap-4">
          {maintenanceLoading ? (
            <Skeleton className="h-6 w-12 rounded-full" />
          ) : (
            <Switch
              checked={!!maintenanceMode}
              onCheckedChange={handleMaintenanceToggle}
              disabled={setMaintenanceMutation.isPending}
            />
          )}
          <span className="text-sm font-medium text-foreground">
            {maintenanceMode ? (
              <span className="text-destructive">Maintenance ON</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">App is Live</span>
            )}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Registered Users</h2>
          {users && (
            <Badge variant="secondary" className="ml-auto">
              {users.length} total
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by Unique ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loading State */}
        {usersLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Error State */}
        {usersError && !usersLoading && (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load users. Make sure you are logged in as admin.
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!usersLoading && !usersError && users && users.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No users registered yet.</p>
          </div>
        )}

        {/* No search results */}
        {!usersLoading && !usersError && users && users.length > 0 && filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No users found matching &quot;{searchTerm}&quot;.
          </div>
        )}

        {/* Users Table */}
        {!usersLoading && !usersError && filteredUsers.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Server</TableHead>
                  <TableHead className="whitespace-nowrap">Unique Code</TableHead>
                  <TableHead className="whitespace-nowrap">Device ID</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isBlocking =
                    blockMutation.isPending && blockMutation.variables === user.uniqueCode;
                  const isUnblocking =
                    unblockMutation.isPending && unblockMutation.variables === user.uniqueCode;
                  const isBusy = isBlocking || isUnblocking;

                  return (
                    <TableRow key={user.uniqueCode}>
                      <TableCell className="font-medium max-w-[100px] truncate">
                        {user.name}
                      </TableCell>
                      <TableCell className="max-w-[80px] truncate">{user.server}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                          {user.uniqueCode}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[100px]">
                        <span
                          title={user.deviceId}
                          className="block truncate"
                          style={{ maxWidth: '90px' }}
                        >
                          {user.deviceId}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="text-xs">
                            Blocked
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.isBlocked ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isBusy}
                                className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                {isUnblocking ? 'Unblocking…' : 'Unblock'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unblock User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will restore access for{' '}
                                  <strong>{user.name}</strong> ({user.uniqueCode}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleUnblock(user.uniqueCode)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Unblock
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isBusy}
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                <ShieldOff className="w-3.5 h-3.5 mr-1" />
                                {isBlocking ? 'Blocking…' : 'Block'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Block User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will suspend access for{' '}
                                  <strong>{user.name}</strong> ({user.uniqueCode}). They will see
                                  the ban screen until unblocked.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleBlock(user.uniqueCode)}
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                >
                                  Block
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
