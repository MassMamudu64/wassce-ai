import { useEffect } from "react";

type Status = "PENDING" | "SUCCESS" | "FAILED";

export const usePaymentPolling = (paymentId: string | null, onStatus: (status: Status) => void) => {
  useEffect(() => {
    if (!paymentId) return;
    let timer: number | null = null;

    const poll = async () => {
      const res = await fetch(`/api/payments/${paymentId}`);
      const data = (await res.json()) as { status?: Status };
      if (!data.status) return;
      onStatus(data.status);
      if (data.status !== "PENDING" && timer) window.clearInterval(timer);
    };

    timer = window.setInterval(poll, 2000);
    void poll();
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [onStatus, paymentId]);
};

