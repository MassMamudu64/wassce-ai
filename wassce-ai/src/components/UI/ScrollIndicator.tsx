import { useEffect, useState, type RefObject } from "react";

type ScrollIndicatorProps = {
  targetRef: RefObject<HTMLElement | null>;
};

type ScrollState = {
  visible: boolean;
  thumbTop: number;
  thumbHeight: number;
};

const defaultState: ScrollState = { visible: false, thumbTop: 0, thumbHeight: 0 };

export default function ScrollIndicator({ targetRef }: ScrollIndicatorProps) {
  const [state, setState] = useState<ScrollState>(defaultState);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight + 1) {
        setState(defaultState);
        return;
      }
      const trackHeight = clientHeight - 24;
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
  }, [targetRef]);

  if (!state.visible) return null;

  return (
    <div className="pointer-events-none absolute right-2 top-3 bottom-3 z-10 block w-1.5 rounded-full bg-slate-800/60">
      <div
        className="absolute left-0 right-0 rounded-full bg-slate-200/80"
        style={{ height: state.thumbHeight, transform: `translateY(${state.thumbTop}px)` }}
      />
    </div>
  );
}
