import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-8 bg-red-50 rounded-lg border border-red-200 my-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Something went wrong
          </h2>
          <details className="text-sm text-gray-700 whitespace-pre-wrap">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              View error details
            </summary>
            <p className="mt-2 mb-1 font-medium">Error:</p>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
              {this.state.error && this.state.error.toString()}
            </pre>
            <p className="mt-3 mb-1 font-medium">Component Stack:</p>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          {this.props.fallback || (
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
