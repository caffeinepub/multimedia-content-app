import { useState, useEffect } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSessionParameter } from '../utils/urlParams';

let adminActorInstance: backendInterface | null = null;
let adminActorInitialized = false;
let adminActorInitializing = false;

export function useAdminActor() {
  const [isFetching, setIsFetching] = useState(!adminActorInitialized);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (adminActorInitialized) {
      setIsFetching(false);
      return;
    }
    if (adminActorInitializing) return;

    const initAdminActor = async () => {
      adminActorInitializing = true;
      setIsFetching(true);

      try {
        // Read the admin token from sessionStorage (set by PINAuthGuard on successful PIN entry)
        const adminToken = getSessionParameter('caffeineAdminToken') || '';

        if (!adminToken) {
          // Token not yet available — reset so we can retry when it becomes available
          adminActorInitializing = false;
          setIsFetching(false);
          return;
        }

        const actor = await createActorWithConfig();
        // Initialize with admin token — must succeed for admin operations to work
        await actor._initializeAccessControlWithSecret(adminToken);
        adminActorInstance = actor;
        adminActorInitialized = true;
      } catch (error) {
        console.error('Failed to initialize admin actor:', error);
        // Allow retry on next mount by resetting the initializing flag
        adminActorInitializing = false;
        adminActorInstance = null;
        adminActorInitialized = false;
        setIsFetching(false);
        return;
      }

      adminActorInitializing = false;
      setIsFetching(false);
      forceUpdate((n) => n + 1);
    };

    initAdminActor();
  }, []);

  // If not yet initialized, try again when sessionStorage token becomes available
  useEffect(() => {
    if (adminActorInitialized || adminActorInitializing) return;

    const token = getSessionParameter('caffeineAdminToken');
    if (!token) return;

    // Token is now available, trigger initialization
    const initAdminActor = async () => {
      adminActorInitializing = true;
      setIsFetching(true);

      try {
        const actor = await createActorWithConfig();
        await actor._initializeAccessControlWithSecret(token);
        adminActorInstance = actor;
        adminActorInitialized = true;
      } catch (error) {
        console.error('Failed to initialize admin actor (retry):', error);
        adminActorInitializing = false;
        adminActorInstance = null;
        adminActorInitialized = false;
        setIsFetching(false);
        return;
      }

      adminActorInitializing = false;
      setIsFetching(false);
      forceUpdate((n) => n + 1);
    };

    initAdminActor();
  });

  return {
    actor: adminActorInitialized ? adminActorInstance! : null,
    isFetching,
  };
}
