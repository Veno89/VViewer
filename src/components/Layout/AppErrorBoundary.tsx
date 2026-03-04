import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Keep console logging for debugging unexpected production crashes.
    console.error('Unhandled application error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-950">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-md dark:border-red-900 dark:bg-gray-900">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              VViewer hit an unexpected error. Refresh the page to continue.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
