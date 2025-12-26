/**
 * Chat Copilot Mobile App
 * @format
 */

import React, { ErrorInfo } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Global error handler for logging/reporting
const handleGlobalError = (error: Error, errorInfo: ErrorInfo) => {
  // TODO: Send to error reporting service (e.g., Sentry, Crashlytics)
  console.error('[Global Error]', error.message);
  console.error('[Component Stack]', errorInfo.componentStack);
};

function App(): React.JSX.Element {
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
            <AppNavigator />
          </SafeAreaProvider>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;
