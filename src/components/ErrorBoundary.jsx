import React from 'react';
import HttpErrorPage from '../pages/errors/HttpErrorPage';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Academic Suite Unhandled Error Boundary Caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errDetails = this.state.error?.message || this.state.error?.toString() || '';
      return (
        <HttpErrorPage
          code={500}
          title="500 — Application Processing Error"
          message={`An unexpected rendering problem occurred in this view. ${errDetails ? `[Diagnostic: ${errDetails}]` : 'Your academic data is secure in the database. Please try reloading.'}`}
          showRetry={true}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
