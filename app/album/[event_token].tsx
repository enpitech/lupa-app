import { AlbumViewer } from '@/components/features/album-viewer/album-viewer';
import { theme } from '@/constants/theme';
import { useAlbumTree } from '@/hooks/use-album-tree';
import { useEpilogProlog } from '@/hooks/use-epilog-prolog';
import { useTranslation } from '@/hooks/use-translation';
import { useNavigation } from '@react-navigation/native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function AlbumScreen() {
  const navigation = useNavigation();

  // Lock to landscape on mount, restore portrait only when leaving this screen
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    });

    return unsubscribe;
  }, [navigation]);

  const { event_token } = useLocalSearchParams<{ event_token: string }>();
  const { t } = useTranslation();
  const {
    data: albumTree,
    isLoading,
    isError,
    refetch,
  } = useAlbumTree({ eventToken: event_token });

  const { data: prologData } = useEpilogProlog({
    eventToken: event_token,
    isEpilog: false,
    enabled: !!albumTree,
  });

  const { data: epilogData } = useEpilogProlog({
    eventToken: event_token,
    isEpilog: true,
    enabled: !!albumTree,
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      )}

      {albumTree && !albumTree.m_treeV5 && (
        <View style={styles.center}>
          <ActivityIndicator size="large" style={styles.processingSpinner} />
          <Text style={styles.processingText}>{t('album.processing')}</Text>
        </View>
      )}

      {albumTree?.m_treeV5 && (
        <AlbumViewer
          album={albumTree}
          eventToken={event_token}
          prologData={prologData}
          epilogData={epilogData}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  processingSpinner: {
    marginBottom: theme.spacing.md,
  },
  processingText: {
    ...theme.typography.body,
    color: theme.colors.palette.neutral600,
    textAlign: 'center',
    paddingHorizontal: theme.screenPadding.horizontal,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.tint,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    ...theme.typography.button,
    color: '#fff',
  },
});
