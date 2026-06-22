import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Error caught by boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-gray-300">Oops!</h1>
            <p className="text-gray-500 mt-4">Something went wrong.</p>
            <p className="text-gray-400 text-sm mt-2">{this.state.error && this.state.error.message}</p>
            <button
              onClick={function() { window.location.reload() }}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary