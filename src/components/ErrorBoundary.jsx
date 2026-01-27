import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h1 style={styles.title}>Something went wrong</h1>
          <p style={styles.message}>{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={styles.button}
          >
            Reload Page
          </button>
          <details style={styles.details}>
            <summary style={styles.summary}>Error details</summary>
            <pre style={styles.pre}>{this.state.error?.stack}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  title: { fontSize: '1.5rem', marginBottom: '1rem' },
  message: { color: 'var(--text-muted)', marginBottom: '1.5rem' },
  button: {
    padding: '0.75rem 1.5rem',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  details: { marginTop: '2rem', maxWidth: 600, width: '100%' },
  summary: { cursor: 'pointer', marginBottom: '0.5rem' },
  pre: {
    background: 'var(--bg-card)',
    padding: '1rem',
    borderRadius: 8,
    overflow: 'auto',
    fontSize: '0.85rem',
  },
}
