import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { Ionicons } from '@expo/vector-icons';
import type { PinturaImageState } from '@pqina/pintura';
import PinturaEditorComponent, { type default as PinturaEditorClass } from '@pqina/react-native-expo-pintura';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PinturaEditorProps = {
  /** Pre-loaded base64 data URI to edit. If not provided, shows an image picker. */
  initialSource?: string;
  onImageProcessed?: (dataUri: string) => void;
};

export function PinturaEditor({ initialSource, onImageProcessed }: PinturaEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<PinturaEditorClass>(null);
  const [editorSource, setEditorSource] = useState<string | undefined>(initialSource);
  const [resultPreview, setResultPreview] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const pickImage = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
        base64: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const [asset] = result.assets;

      let base64 = asset.base64;
      if (!base64) {
        base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const mimeType = asset.mimeType ?? 'image/jpeg';
      setEditorSource(`data:${mimeType};base64,${base64}`);
      setResultPreview(undefined);
    } catch (err) {
      setError(t('imageEditor.loadError'));
      console.error('PinturaEditor: pickImage error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = ({ dest, imageState }: { dest: string; imageState: PinturaImageState }) => {
    console.log('PinturaEditor: processed imageState:', JSON.stringify(imageState));
    console.log('PinturaEditor: base64 result:', dest);
    setResultPreview(dest);
    onImageProcessed?.(dest);
  };

  const handleUndo = () => {
    editorRef.current?.editor.history.undo();
  };

  const handleRedo = () => {
    editorRef.current?.editor.history.redo();
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {resultPreview && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>
            {t('imageEditor.resultPreview')}
          </Text>
          <Image
            source={{ uri: resultPreview }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      )}

      {editorSource ? (
        <View style={styles.editorWrapper}>
          <PinturaEditorComponent
            ref={editorRef}
            style={styles.editor}
            styleRules={`
              .pintura-editor {
                --color-background: 255, 255, 255;
                --color-foreground: 0, 0, 0;
              }
            `}
            src={editorSource}
            onLoad={({ size }) => {
              console.log('PinturaEditor: loaded', size);
            }}
            onLoaderror={(err) => {
              console.error('PinturaEditor: load error', err);
              setError(t('imageEditor.editorLoadError'));
            }}
            onProcess={handleProcess}
          />

          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleUndo}>
              <Ionicons name="arrow-undo" size={20} color={theme.colors.textInverse} />
              <Text style={styles.toolbarButtonText}>{t('imageEditor.undo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarButton} onPress={handleRedo}>
              <Ionicons name="arrow-redo" size={20} color={theme.colors.textInverse} />
              <Text style={styles.toolbarButtonText}>{t('imageEditor.redo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color={theme.colors.textInverse} />
              <Text style={styles.toolbarButtonText}>{t('imageEditor.change')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.pickButton}
          onPress={pickImage}
          disabled={isLoading}
        >
          <Ionicons name="image-outline" size={48} color={theme.colors.tint} />
          <Text style={styles.pickButtonText}>
            {isLoading ? t('common.loading') : t('imageEditor.selectImage')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: theme.colors.errorBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  previewLabel: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
  },
  editorWrapper: {
    flex: 1,
    width: '100%',
  },
  editor: {
    flex: 1,
    width: '100%',
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
    backgroundColor: theme.colors.palette.neutral800,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  toolbarButtonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.sm,
  },
  pickButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: theme.borderWidth.medium,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  pickButtonText: {
    ...theme.typography.label,
    color: theme.colors.tint,
    fontSize: theme.fontSize.md,
  },
});
