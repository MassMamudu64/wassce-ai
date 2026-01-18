import { useEffect, useState, type RefObject } from "react";

type ScrollIndicatorProps = {
  targetRef: RefObject<HTMLElement | null>;
  tone?: "light" | "dark";
};

type ScrollState = {
  visible: boolean;
  thumbTop: number;
  thumbHeight: number;
};

const defaultState: ScrollState = { visible: false, thumbTop: 0, thumbHeight: 0 };

export default function ScrollIndicator({ targetRef, tone = "light" }: ScrollIndicatorProps) {
  const [state, setState] = useState<ScrollState>(defaultState);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const updateMedia = () => setIsMobile(media.matches);
    updateMedia();
    media.addEventListener("change", updateMedia);
    return () => media.removeEventListener("change", updateMedia);
  }, []);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const topOffset = 12;
    const bottomOffset = isMobile ? 96 : 12;
    const trackPadding = topOffset + bottomOffset;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 1) {
        setState(defaultState);
        return;
      }
      const trackHeight = Math.max(0, clientHeight - trackPadding);
      if (trackHeight === 0) {
        setState(defaultState);
        return;
      }
      const thumbHeight = Math.max(28, Math.round((clientHeight / scrollHeight) * trackHeight));
      const maxTop = Math.max(0, trackHeight - thumbHeight);
      const ratio = scrollTop / (scrollHeight - clientHeight);
      setState({ visible: true, thumbTop: Math.round(maxTop * ratio), thumbHeight });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [isMobile, targetRef]);

  if (!state.visible) return null;

  const trackClass = tone === "dark" ? "bg-slate-800/70" : "bg-slate-200/80";
  const thumbClass = tone === "dark" ? "bg-slate-100/80" : "bg-slate-600/80";

  return (
    <div
      className={`pointer-events-none absolute right-2 z-10 block w-2 rounded-full shadow-sm ${trackClass}`}
      style={{ top: 12, bottom: isMobile ? 96 : 12 }}
    >
      <div
        className={`absolute left-0 right-0 rounded-full ${thumbClass}`}
        style={{ height: state.thumbHeight, transform: `translateY(${state.thumbTop}px)` }}
      />
    </div>
  );
}
