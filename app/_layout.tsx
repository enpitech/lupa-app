import { Toasts } from '@backpackapp-io/react-native-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocaleProvider } from '@/contexts/locale-context';
import { queryClient } from '@/services/api/query-client-config';
import { useAuthLoaderStore } from '@/stores/auth-loader';
import { initializeAuth } from '@/utils/initialize-auth';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'LupaSans-Regular': require('../assets/fonts/LUPASANS-REGULAR.ttf'),
    'LupaSans-Bold': require('../assets/fonts/LUPASANS-BOLD.ttf'),
  });

  useEffect(() => {
    useAuthLoaderStore.getState().setLoading();
    initializeAuth(queryClient);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
                name="create-album"
                options={{
                  headerShown: true,
                  title: 'Create Album',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="photo-upload/[event_token]"
                options={{
                  headerShown: true,
                  title: 'Upload Photos',
                  headerBackVisible: false,
                }}
              />
              <Stack.Screen
                name="album-wizard/[event_token]"
                options={{
                  headerShown: true,
                  title: 'Album Style',
                  headerBackVisible: false,
                }}
              />
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
