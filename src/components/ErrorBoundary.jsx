import { Component } from 'react';
import { C } from '../styles/tokens';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.bg0, color: C.white, fontFamily: 'sans-serif', padding: '24px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
          <pre style={{ background: C.bg2, padding: '16px', borderRadius: '8px', maxWidth: '600px', overflow: 'auto', color: C.red, fontSize: '14px', marginBottom: '24px' }}>
            {this.state.error && this.state.error.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '10px 24px', background: C.gold, color: C.bg0, border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
