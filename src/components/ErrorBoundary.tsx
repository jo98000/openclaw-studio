"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackLabel?: string;
  retryLabel?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <AlertTriangle
            className="h-6 w-6 text-destructive"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {this.props.fallbackLabel ?? "Une erreur est survenue"}
            </p>
            {this.state.error ? (
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                {this.state.error.message}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="ui-btn-ghost inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium"
            onClick={this.handleRetry}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            {this.props.retryLabel ?? "Réessayer"}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
