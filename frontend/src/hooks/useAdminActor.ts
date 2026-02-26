import { useState, useEffect } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

let adminActorInstance: backendInterface | null = null;
let adminActorInitialized = false;
let adminActorInitializing = false;

export function useAdminActor() {
  const [isFetching, setIsFetching] = useState(!adminActorInitialized);

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
        const actor = await createActorWithConfig();
        const adminToken = getSecretParameter('caffeineAdminToken') || '';
        if (adminToken) {
          try {
            await (actor as any)._initializeAccessControlWithSecret(adminToken);
          } catch {
            // Not an admin context, ignore
          }
        }
        adminActorInstance = actor;
        adminActorInitialized = true;
      } catch (error) {
        console.error('Failed to initialize admin actor:', error);
      } finally {
        adminActorInitializing = false;
        setIsFetching(false);
      }
    };

    initAdminActor();
  }, []);

  return {
    actor: adminActorInitialized ? adminActorInstance! : null,
    isFetching,
  };
}
