import * as React from 'react';

export interface ErrorBoundaryProps {
  /**
   * Human readable name for error boundary. User this to help debugging where the exception hapenned.
   */
  name?: string;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}
/**
 * Error boundary to restrict crash on ui to restricted area.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      hasError: true,
      errorMessage: error.message,
    });

    console.error(error);
  }

  public render() {
    const { name, children } = this.props;
    const { hasError, errorMessage } = this.state;

    if (hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong {name && `at ${name}`}</h1>
          <span>{errorMessage}</span>
        </div>
      );
    }
    return children;
  }
}
