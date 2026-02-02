import * as React from "react";
import type { AppRole } from "@/contexts/DevAuthContext";
import { getDefaultQuickAccess } from "@/config/bottomNav";

export interface BottomNavConfig {
  leftPath: string | null;
  rightPath: string | null;
}

function storageKey(userId: string) {
  return `bjjoss.bottom_nav.v1.${userId}`;
}

export function useBottomNavConfig(params: { userId?: string; role: AppRole | null }) {
  const { userId, role } = params;
  const defaults = React.useMemo(() => getDefaultQuickAccess(role), [role]);

  const [config, setConfig] = React.useState<BottomNavConfig>(() => ({
    leftPath: defaults.leftPath,
    rightPath: defaults.rightPath,
  }));

  // Load from storage when userId changes
  React.useEffect(() => {
    if (!userId) return;

    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (!raw) {
        setConfig({ leftPath: defaults.leftPath, rightPath: defaults.rightPath });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<BottomNavConfig>;
      setConfig({
        leftPath: parsed.leftPath ?? defaults.leftPath,
        rightPath: parsed.rightPath ?? defaults.rightPath,
      });
    } catch {
      setConfig({ leftPath: defaults.leftPath, rightPath: defaults.rightPath });
    }
  }, [userId, defaults.leftPath, defaults.rightPath]);

  const persist = React.useCallback(
    (next: BottomNavConfig) => {
      setConfig(next);
      if (!userId) return;
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [userId],
  );

  const update = React.useCallback(
    (partial: Partial<BottomNavConfig>) => {
      persist({ ...config, ...partial });
    },
    [config, persist],
  );

  const reset = React.useCallback(() => {
    persist({ leftPath: defaults.leftPath, rightPath: defaults.rightPath });
  }, [defaults.leftPath, defaults.rightPath, persist]);

  const swap = React.useCallback(() => {
    persist({ leftPath: config.rightPath, rightPath: config.leftPath });
  }, [config.leftPath, config.rightPath, persist]);

  return { config, update, reset, swap, defaults };
}
