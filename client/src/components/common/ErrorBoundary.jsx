import { Component } from 'react';

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
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Une erreur est survenue</h1>
          <p>Veuillez rafraîchir la page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
