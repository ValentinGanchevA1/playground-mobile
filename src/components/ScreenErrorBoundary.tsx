// src/components/ScreenErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Wrapper to use navigation hook
const ErrorFallbackWithNavigation: React.FC<{
  error: Error | null;
  screenName?: string;
  onRetry: () => void;
}> = ({ error, screenName, onRetry }) => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="alert-outline" size={56} color="#FFC107" />
        </View>

        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          {screenName
            ? `There was a problem loading ${screenName}`
            : 'There was a problem loading this screen'}
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} numberOfLines={3}>
              {error.message}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Icon name="arrow-left" size={18} color="#fff" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Icon name="refresh" size={18} color="#000" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export class ScreenErrorBoundary extends Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ScreenErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`ScreenErrorBoundary [${this.props.screenName}]:`, error);
    console.error('Component stack:', errorInfo.componentStack);

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallbackWithNavigation
          error={this.state.error}
          screenName={this.props.screenName}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping screen components
export function withScreenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName?: string,
): React.FC<P> {
  return function WrappedWithErrorBoundary(props: P) {
    return (
      <ScreenErrorBoundary screenName={screenName}>
        <WrappedComponent {...props} />
      </ScreenErrorBoundary>
    );
  };
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
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#1a1a24',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default ScreenErrorBoundary;
