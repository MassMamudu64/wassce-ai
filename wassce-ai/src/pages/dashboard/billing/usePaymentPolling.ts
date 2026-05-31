import { useEffect, useRef } from "react";
import { authedFetch } from "../../../utils/apiClient";

type Status = "PENDING" | "SUCCESS" | "FAILED";

export const usePaymentPolling = (paymentId: string | null, onStatus: (status: Status) => void) => {
  // Keep the latest callback in a ref so a new inline arrow on each render
  // doesn't tear down and recreate the polling interval every render.
  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    if (!paymentId) return;
    let timer: number | null = null;

    const poll = async () => {
      try {
        const res = await authedFetch(`/api/payments/${paymentId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { status?: Status };
        if (!data.status) return;
        onStatusRef.current(data.status);
        if (data.status !== "PENDING" && timer) window.clearInterval(timer);
      } catch {
        // Transient network error — keep polling on the next tick.
      }
    };

    timer = window.setInterval(poll, 2000);
    void poll();
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [paymentId]);
};

