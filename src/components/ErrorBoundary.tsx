"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex min-h-[300px] items-center justify-center p-8"
          style={{ color: "var(--foreground)" }}
        >
          <div className="max-w-md text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
            <h2 className="mb-2 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              Something went wrong
            </h2>
            <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
