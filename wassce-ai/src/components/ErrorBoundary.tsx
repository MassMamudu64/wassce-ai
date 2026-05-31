import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * App-level error boundary. Catches render/runtime errors anywhere in the tree
 * and shows a recoverable fallback instead of a blank white screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : "Something went wrong" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for a monitoring service (e.g. Sentry) in production.
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ hasError: false, message: "" });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-100">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-slate-400">
            The page hit an unexpected error. You can reload and continue studying — your saved progress is safe.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
