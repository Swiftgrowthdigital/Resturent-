import React from 'react';
import { ErrorScreen } from './ErrorScreen';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Application error boundary caught an error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          title="The app hit a snag"
          description={this.state.error?.message || 'A rendering error occurred. Please retry or return home.'}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
