import { useLiveQuery } from 'dexie-react-hooks';
import { db, type AppSettings } from '../db/schema';
import { useEffect, useState } from 'react';

export const useOnboarding = () => {
  const [isReady, setIsReady] = useState(false);
  
  const onboardingStatus = useLiveQuery(
    () => db.app_settings.get('onboarding_status'),
    []
  );

  useEffect(() => {
    let isMounted = true;
    const initDb = async () => {
      try {
        const existing = await db.app_settings.get('onboarding_status');
        if (!existing) {
          await db.app_settings.put({
            key: 'onboarding_status',
            isGlobalTourSeen: false,
            isCoachMarkSeen: false,
            isWalkGuideSeen: false,
            isDiaryLimitSeen: false,
            isSettingsWarnSeen: false
          });
        }
      } catch (e) {
        console.error('Failed to init onboarding status', e);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };
    initDb();
    return () => { isMounted = false; };
  }, []);

  const status: AppSettings = onboardingStatus || {
    key: 'onboarding_status',
    isGlobalTourSeen: false,
    isCoachMarkSeen: false,
    isWalkGuideSeen: false,
    isDiaryLimitSeen: false,
    isSettingsWarnSeen: false
  };

  const completeGuide = async (field: keyof Omit<AppSettings, 'key'>) => {
    try {
      const existing = await db.app_settings.get('onboarding_status');
      if (!existing) {
        const newStatus = { ...status, [field]: true };
        await db.app_settings.put(newStatus);
      } else {
        await db.app_settings.update('onboarding_status', {
          [field]: true
        });
      }
    } catch (err) {
      console.error('Failed to update onboarding guide status:', err);
    }
  };

  return {
    ...status,
    completeGuide,
    isLoading: !isReady && onboardingStatus === undefined
  };
};
