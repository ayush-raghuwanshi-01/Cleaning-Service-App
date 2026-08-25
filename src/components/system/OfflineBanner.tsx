import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { createLogger } from "@/lib/logger";

const log = createLogger("network");

/**
 * Global connectivity banner. Sits above the page content when the browser
 * reports no network, and disappears the moment connectivity returns.
 * Pairs with the toast fired on reconnect so users trust their actions
 * will reach the server again.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOffline = () => {
      setOnline(false);
      log.info("browser went offline");
    };
    const goOnline = () => {
      setOnline(true);
      log.info("browser back online");
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[90] flex items-center justify-center gap-2 bg-highlight px-4 py-2 text-center text-sm font-semibold text-white no-print"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      You're offline — bookings will resume when your connection returns.
    </div>
  );
}
