import { PinturaEditor } from '@/components/features/pintura-editor/pintura-editor';
import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImageEditorModal() {
  const { t } = useTranslation();

  const handleImageProcessed = (dataUri: string) => {
    console.log('ImageEditorModal: processed, size:', dataUri.length);
    console.log('ImageEditorModal: base64 result:', dataUri);
    // TODO: pass result back to the calling screen via a store or callback
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {t('imageEditor.title')}
        </Text>
        <View style={styles.closeButton} />
      </View>
      <View style={styles.editorContainer}>
        <PinturaEditor onImageProcessed={handleImageProcessed} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: theme.borderWidth.thin,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h5,
    color: theme.colors.text,
  },
  editorContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
});
