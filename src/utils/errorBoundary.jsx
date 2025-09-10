import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to analytics
    this.logError(error, errorInfo)
  }

  logError = (error, errorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      }
      
      // Store error in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('chronosphere_errors') || '[]')
      existingErrors.unshift(errorData)
      
      // Keep only last 10 errors
      localStorage.setItem('chronosphere_errors', JSON.stringify(existingErrors.slice(0, 10)))
      
      console.error('Error caught by boundary:', errorData)
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  handleRestart = () => {
    // Clear error state and reload
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    })
    
    // Clear any potentially corrupted data
    try {
      localStorage.removeItem('chronosphere-timer')
      localStorage.removeItem('chronosphere-productivity')
      localStorage.removeItem('chronosphere-settings')
    } catch (e) {
      console.warn('Failed to clear localStorage:', e)
    }
    
    // Force a page reload as last resort
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    })
  }

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state
    
    const errorReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      componentStack: errorInfo?.componentStack || '',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error report copied to clipboard. Please share this with the development team.')
    }).catch(() => {
      // Fallback: show error report in a modal
      const reportWindow = window.open('', '_blank', 'width=600,height=400')
      reportWindow.document.write(`
        <html>
          <head><title>Error Report</title></head>
          <body>
            <h2>Chronosphere Error Report</h2>
            <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">
${JSON.stringify(errorReport, null, 2)}
            </pre>
          </body>
        </html>
      `)
    })
  }

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
          <div className="glass-panel p-8 max-w-lg w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Error Message */}
            <div>
              <h1 className="text-2xl font-space font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-300 mb-4">
                The sphere encountered an unexpected error and needs to reform.
              </p>
              <div className="text-sm text-gray-400 bg-black/20 rounded-lg p-3 mb-4">
                <strong>Error ID:</strong> {errorId}
                <br />
                <strong>Message:</strong> {error?.message || 'Unknown error occurred'}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleRestart}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Reset Application
              </button>
              
              <button
                onClick={this.handleReportError}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Report Error
              </button>
            </div>
            
            {/* Help Text */}
            <div className="text-xs text-gray-400 space-y-1">
              <p>If this error persists:</p>
              <p>1. Try refreshing the page</p>
              <p>2. Clear your browser cache</p>
              <p>3. Report the error using the button above</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    console.error('Error handled by useErrorHandler:', error, errorInfo)
    
    // You could dispatch this to an error reporting service
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...errorInfo
    }
    
    // Store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('chronosphere_errors') || '[]')
      errors.unshift(errorData)
      localStorage.setItem('chronosphere_errors', JSON.stringify(errors.slice(0, 10)))
    } catch (e) {
      console.warn('Failed to store error:', e)
    }
  }
  
  return { handleError }
}

export default ErrorBoundary