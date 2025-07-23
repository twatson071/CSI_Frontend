import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RuxButton, RuxContainer, RuxIcon } from '@astrouxds/react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset on prop changes if enabled
    if (hasError && prevProps.children !== this.props.children && resetOnPropsChange) {
      this.resetErrorBoundary();
    }
    
    // Reset when resetKeys change
    if (resetKeys && this.previousResetKeys.join(',') !== resetKeys.join(',')) {
      this.previousResetKeys = resetKeys;
      if (hasError) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In an air-gapped system, this might write to a local log file
    // or send to a local monitoring service
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // Example: Send to local monitoring endpoint
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog),
    }).catch(err => console.error('Failed to log error:', err));
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReset = () => {
    // Add a small delay to prevent infinite loops
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback, isolate, level = 'component' } = this.props;

    if (hasError && error) {
      // If too many errors in a short time, show permanent error
      if (errorCount > 3) {
        return (
          <RuxContainer className={`error-boundary error-level-${level}`}>
            <div className="error-content critical">
              <RuxIcon icon="error" size="large" className="error-icon" />
              <h2>System Error</h2>
              <p>This component is experiencing repeated errors.</p>
              <p className="error-message">Please refresh the page or contact support.</p>
              <div className="error-actions">
                <RuxButton onClick={() => window.location.reload()}>
                  Refresh Page
                </RuxButton>
              </div>
            </div>
          </RuxContainer>
        );
      }

      // Custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI based on level
      return (
        <RuxContainer className={`error-boundary error-level-${level}`}>
          <div className="error-content">
            <RuxIcon icon="warning" size="large" className="error-icon" />
            <h2>
              {level === 'page' && 'Page Error'}
              {level === 'section' && 'Section Error'}
              {level === 'component' && 'Component Error'}
            </h2>
            <p>Something went wrong in this {level}.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">
                  {error.toString()}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <RuxButton onClick={this.handleReset}>
                Try Again
              </RuxButton>
              {level === 'page' && (
                <RuxButton secondary onClick={() => window.history.back()}>
                  Go Back
                </RuxButton>
              )}
            </div>
          </div>
        </RuxContainer>
      );
    }

    // If isolate is true, wrap children in a div to prevent error propagation
    if (isolate) {
      return <div className="error-boundary-wrapper">{children}</div>;
    }

    return children;
  }
}

// Functional component wrapper with hooks support
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;