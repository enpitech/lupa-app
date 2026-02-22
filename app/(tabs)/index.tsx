import { AlbumCard } from '@/components/features/album-card/album-card';
import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useUserAlbums } from '@/hooks/use-user-albums';
import { useUserStore } from '@/stores/user';
import type { Album } from '@/types/album';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { data: albums, isLoading, isError, refetch } = useUserAlbums();
  const logout = useUserStore((state) => state.logout);

  const renderItem = ({ item }: { item: Album }) => (
    <AlbumCard album={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{t('home.myAlbums')}</Text>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

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

      {!isLoading && !isError && albums && albums.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('home.noAlbums')}</Text>
        </View>
      )}

      {!isLoading && !isError && albums && albums.length > 0 && (
        <FlatList
          data={albums}
          renderItem={renderItem}
          keyExtractor={(item) => item.event_token}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.screenPadding.horizontal,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  header: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  logoutButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  logoutText: {
    ...theme.typography.button,
    color: '#fff',
    fontSize: theme.fontSize.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: theme.screenPadding.horizontal - theme.spacing.xs / 2,
    paddingBottom: theme.spacing.xl,
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
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.palette.neutral600,
  },
});
