import { theme } from '@/constants/theme';
import { getLoginUrl } from '@/services/api/config';
import { useUserStore } from '@/stores/user';
import type { User } from '@/types/user';
import { router } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

const LOGIN_METHOD = 'loginregister';
const LOGIN_CHANNEL = 'calendar';

/**
 * The Connect service uses `window.parent.postMessage` to communicate back
 * to the host. In a WebView there's no parent frame, so we inject a small
 * script that intercepts those calls and forwards them through the React
 * Native WebView bridge (`window.ReactNativeWebView.postMessage`).
 */
const BRIDGE_SCRIPT = `
  (function() {
    var originalPostMessage = window.parent.postMessage;
    window.parent.postMessage = function(data, origin) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
      originalPostMessage.call(window.parent, data, origin);
    };
  })();
  true;
`;

export default function LoginScreen() {
  const login = useUserStore((state) => state.login);
  const webViewRef = useRef<WebView>(null);

  const loginUrl = getLoginUrl({
    method: LOGIN_METHOD,
    params: { channel: LOGIN_CHANNEL },
  });

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      const connectData = parsed?.connect;

      if (!connectData) return;

      const user: User = {
        name: connectData.user_name ?? '',
        email: connectData.email ?? '',
        firstName: connectData.user_name ?? '',
        lastName: connectData.user_last_name ?? '',
        token: connectData.token ?? '',
        refreshtoken: connectData.refreshtoken ?? connectData.token ?? '',
        isAuthenticated: true,
        isRegister: connectData.isRegister ?? false,
        lupaWebIframe: connectData.lupaWebIframe ?? '',
      };

      console.log('📱 Login successful - User data:', user);

      login(user);
      router.replace('/(tabs)');
    } catch {
      // Ignore non-JSON messages from the WebView
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: loginUrl }}
        injectedJavaScript={BRIDGE_SCRIPT}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        // Allow the Connect service to open OAuth popups
        setSupportMultipleWindows={false}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
