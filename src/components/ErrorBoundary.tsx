// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });
  };

  toggleErrorDetails = (): void => {
    this.setState((prev) => ({ showErrorDetails: !prev.showErrorDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showErrorDetails } = this.state;
      const { showDetails = __DEV__ } = this.props;

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Icon name="alert-circle-outline" size={80} color="#ff4444" />
            </View>

            {/* Error Message */}
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <Icon name="refresh" size={20} color="#000" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>

            {/* Error Details (Dev mode) */}
            {showDetails && (
              <View style={styles.detailsSection}>
                <TouchableOpacity
                  style={styles.detailsToggle}
                  onPress={this.toggleErrorDetails}
                >
                  <Text style={styles.detailsToggleText}>
                    {showErrorDetails ? 'Hide' : 'Show'} Error Details
                  </Text>
                  <Icon
                    name={showErrorDetails ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>

                {showErrorDetails && (
                  <ScrollView style={styles.errorDetails}>
                    <Text style={styles.errorName}>{error?.name}</Text>
                    <Text style={styles.errorMessage}>{error?.message}</Text>
                    {errorInfo?.componentStack && (
                      <>
                        <Text style={styles.stackTitle}>Component Stack:</Text>
                        <Text style={styles.stackTrace}>
                          {errorInfo.componentStack}
                        </Text>
                      </>
                    )}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  detailsSection: {
    marginTop: 40,
    width: '100%',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  detailsToggleText: {
    fontSize: 13,
    color: '#666',
  },
  errorDetails: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    maxHeight: 200,
  },
  errorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff4444',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 12,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  stackTrace: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
