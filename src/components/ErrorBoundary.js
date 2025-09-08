/*
 ErrorBoundary.js - React Error Boundary Component
 
 This class component catches JavaScript errors in the component tree:
 - Provides graceful error handling for React components
 - Displays user-friendly error messages
 - Shows detailed error information in development mode
 - Includes refresh functionality for error recovery
 - Logs errors for debugging purposes
 
 Ensures the application remains stable even when errors occur in child components.
 */

import React from 'react';

// Styles
const errorContainerStyle = {
  padding: '20px',
  margin: '20px',
  border: '2px solid #e74c3c',
  borderRadius: '8px',
  backgroundColor: '#fdf2f2',
  textAlign: 'center'
};

const errorTitleStyle = {
  color: '#e74c3c',
  marginBottom: '10px'
};

const errorMessageStyle = {
  color: '#666',
  marginBottom: '15px'
};

const errorDetailsStyle = {
  textAlign: 'left',
  backgroundColor: '#f8f9fa',
  padding: '10px',
  borderRadius: '4px',
  marginTop: '15px'
};

const errorSummaryStyle = {
  cursor: 'pointer',
  fontWeight: 'bold'
};

const errorPreStyle = {
  fontSize: '12px',
  overflow: 'auto',
  marginTop: '10px',
  color: '#e74c3c'
};

const refreshButtonStyle = {
  marginTop: '15px',
  padding: '10px 20px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

/*
 Error Boundary component to catch and handle React errors gracefully
 Provides user-friendly error messages and debugging info in development
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In a production app, you might want to send this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div style={errorContainerStyle}>
          <h2 style={errorTitleStyle}>
            Something went wrong
          </h2>
          <p style={errorMessageStyle}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={errorDetailsStyle}>
              <summary style={errorSummaryStyle}>
                Error Details (Development Mode)
              </summary>
              <pre style={errorPreStyle}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={refreshButtonStyle}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
