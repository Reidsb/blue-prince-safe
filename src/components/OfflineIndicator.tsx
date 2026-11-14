import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/usePWAInstall";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-amber-500/50 px-3.5 py-2 text-xs font-medium text-amber-200"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span>Offline Mode — Safe dates and timers are working locally</span>
    </div>
  );
};
