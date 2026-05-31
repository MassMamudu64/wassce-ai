import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Shows a fixed banner whenever the browser loses connectivity, so students on
 * unreliable mobile networks understand why actions (sync, AI, payments) stall.
 */
export default function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 shadow"
    >
      <WifiOff size={16} />
      You are offline. Changes will sync when your connection returns.
    </div>
  );
}
