import { Toasts } from '@backpackapp-io/react-native-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocaleProvider } from '@/contexts/locale-context';
import { queryClient } from '@/services/api/query-client-config';
import { useAuthLoaderStore } from '@/stores/auth-loader';
import { initializeAuth } from '@/utils/initialize-auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    useAuthLoaderStore.getState().setLoading();
    initializeAuth(queryClient);
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <LocaleProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: 'modal',
                  title: 'Modal',
                  headerShown: true,
                }}
              />
              <Stack.Screen name="album/[event_token]" />
              <Stack.Screen
                name="image-editor"
                options={{ presentation: 'fullScreenModal' }}
              />
            </Stack>
            <StatusBar style="auto" />
            <Toasts />
          </LocaleProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
