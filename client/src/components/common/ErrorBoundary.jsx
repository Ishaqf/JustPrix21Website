import { Component } from 'react';
import ErrorPage from './ErrorPage';

// Class component required — React error boundaries can only be implemented
// as class components (getDerivedStateFromError / componentDidCatch have no
// hook equivalents). Wraps the entire app in main.jsx.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage type="500" />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
