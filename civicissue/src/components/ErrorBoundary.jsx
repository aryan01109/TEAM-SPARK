import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message" style={{ padding: 20 }}>
          <h3>Something went wrong</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
