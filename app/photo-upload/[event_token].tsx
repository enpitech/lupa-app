import { theme } from '@/constants/theme';
import { queryKeys } from '@/constants/query-keys';
import { useTranslation } from '@/hooks/use-translation';
import { fetchUploadPhoto } from '@/services/api/fetch-upload-photo';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

type SelectedAsset = {
  uri: string;
  fileName: string;
};

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; uploaded: number; total: number; failed: number }
  | { status: 'done'; failed: number };

export default function PhotoUploadScreen() {
  const { event_token } = useLocalSearchParams<{ event_token: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });

  const isUploading = uploadState.status === 'uploading';
  const isDone = uploadState.status === 'done';

  const handlePickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('photoUpload.permissionTitle'), t('photoUpload.permissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled) {
      const assets: SelectedAsset[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        fileName: asset.fileName ?? `photo_${Date.now()}_${index}.jpg`,
      }));
      setSelectedAssets((prev) => [...prev, ...assets]);
    }
  };

  const handleUploadAndFinish = async () => {
    if (selectedAssets.length === 0 || !event_token) return;

    setUploadState({ status: 'uploading', uploaded: 0, total: selectedAssets.length, failed: 0 });

    let failedCount = 0;

    for (let i = 0; i < selectedAssets.length; i++) {
      const asset = selectedAssets[i];
      try {
        await fetchUploadPhoto({
          eventToken: event_token,
          fileUri: asset.uri,
          fileName: asset.fileName,
        });
      } catch {
        failedCount++;
      }
      setUploadState({
        status: 'uploading',
        uploaded: i + 1,
        total: selectedAssets.length,
        failed: failedCount,
      });
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.albums.list });
    setUploadState({ status: 'done', failed: failedCount });
  };

  const handleSkipAndFinish = () => {
    if (!event_token) return;
    router.replace(`/album-wizard/${event_token}`);
  };

  const handleGoToAlbum = () => {
    if (!event_token) return;
    router.replace(`/album-wizard/${event_token}`);
  };

  const handleRemovePhoto = (uri: string) => {
    setSelectedAssets((prev) => prev.filter((a) => a.uri !== uri));
  };

  const uploadProgress =
    uploadState.status === 'uploading'
      ? uploadState.uploaded / uploadState.total
      : uploadState.status === 'done'
        ? 1
        : 0;

  const renderPhoto = ({ item }: { item: SelectedAsset }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photoThumbnail} />
      {!isUploading && !isDone && (
        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemovePhoto(item.uri)}
          hitSlop={8}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Photo grid */}
        {selectedAssets.length > 0 ? (
          <FlatList
            data={selectedAssets}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.uri}
            numColumns={3}
            style={styles.photoList}
            contentContainerStyle={styles.photoListContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t('photoUpload.emptyState')}</Text>
          </View>
        )}

        {/* Upload progress */}
        {(isUploading || isDone) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress * 100}%` }]} />
            </View>
            {isUploading && (
              <Text style={styles.progressText}>
                {t('photoUpload.progress', {
                  uploaded: uploadState.uploaded,
                  total: uploadState.total,
                })}
              </Text>
            )}
            {isDone && (
              <Text style={styles.progressText}>
                {uploadState.failed > 0
                  ? t('photoUpload.uploadError', { count: uploadState.failed })
                  : t('photoUpload.done')}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Footer actions */}
      <View style={styles.footer}>
        {isDone ? (
          <Pressable style={styles.primaryButton} onPress={handleGoToAlbum}>
            <Text style={styles.primaryButtonText}>{t('photoUpload.viewAlbum')}</Text>
          </Pressable>
        ) : (
          <>
            {!isUploading && (
              <Pressable style={styles.addPhotosButton} onPress={handlePickPhotos}>
                <Text style={styles.addPhotosButtonText}>{t('photoUpload.addPhotos')}</Text>
              </Pressable>
            )}

            <View style={styles.actionRow}>
              {!isUploading && (
                <Pressable style={styles.skipButton} onPress={handleSkipAndFinish}>
                  <Text style={styles.skipButtonText}>{t('photoUpload.skipAndFinish')}</Text>
                </Pressable>
              )}

              {selectedAssets.length > 0 && !isUploading && (
                <Pressable style={styles.primaryButton} onPress={handleUploadAndFinish}>
                  <Text style={styles.primaryButtonText}>{t('photoUpload.uploadAndFinish')}</Text>
                </Pressable>
              )}

              {isUploading && (
                <View style={styles.uploadingRow}>
                  <ActivityIndicator color={theme.colors.tint} />
                  <Text style={styles.uploadingText}>{t('photoUpload.uploading')}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const PHOTO_GAP = theme.spacing.xs / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.screenPadding.horizontal,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.palette.neutral500,
    textAlign: 'center',
  },
  photoList: {
    flex: 1,
  },
  photoListContent: {
    padding: PHOTO_GAP,
  },
  photoItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: PHOTO_GAP,
  },
  photoThumbnail: {
    flex: 1,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.palette.neutral200,
  },
  removeButton: {
    position: 'absolute',
    top: PHOTO_GAP + 4,
    right: PHOTO_GAP + 4,
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  progressContainer: {
    paddingHorizontal: theme.screenPadding.horizontal,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.palette.neutral200,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.tint,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.palette.neutral600,
  },
  footer: {
    padding: theme.screenPadding.horizontal,
    gap: theme.spacing.sm,
  },
  addPhotosButton: {
    borderWidth: theme.borderWidth.medium,
    borderColor: theme.colors.tint,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  addPhotosButtonText: {
    ...theme.typography.button,
    color: theme.colors.tint,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  skipButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
  },
  skipButtonText: {
    ...theme.typography.button,
    color: theme.colors.palette.neutral600,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.tint,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: '#fff',
  },
  uploadingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  uploadingText: {
    ...theme.typography.button,
    color: theme.colors.tint,
  },
});
