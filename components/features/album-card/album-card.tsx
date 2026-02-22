import { theme } from '@/constants/theme';
import { getCoverImageUrl } from '@/services/api/config';
import { useTranslation } from '@/hooks/use-translation';
import type { Album } from '@/types/album';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type AlbumCardProps = {
  album: Album;
};

export function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const coverUrl = getCoverImageUrl({
    eventToken: album.event_token,
    type: 'medium',
  });

  const handlePress = () => {
    router.push(`/album/${album.event_token}`);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Image source={{ uri: coverUrl }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {album.name}
        </Text>
        <Text style={styles.count}>
          {t('home.albumCount', { count: album.image_count })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.palette.neutral300,
  },
  info: {
    padding: theme.spacing.sm,
  },
  name: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  count: {
    ...theme.typography.caption,
    color: theme.colors.palette.neutral600,
    marginTop: 2,
  },
});
