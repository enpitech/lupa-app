import { theme } from '@/constants/theme';
import { useCreateAlbum } from '@/hooks/use-create-album';
import { useTranslation } from '@/hooks/use-translation';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EVENT_TYPES = [
  { value: 'REGULAR', labelKey: 'createAlbum.eventType.regular' },
  { value: 'SQUARE_600', labelKey: 'createAlbum.eventType.square600' },
  { value: 'MINI_LUPA', labelKey: 'createAlbum.eventType.miniLupa' },
  { value: 'HAGGADAH', labelKey: 'createAlbum.eventType.haggadah' },
] as const;

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 64;

export default function CreateAlbumScreen() {
  const { t, i18n } = useTranslation();
  const [albumName, setAlbumName] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('REGULAR');

  const { mutate: createAlbum, isPending, error } = useCreateAlbum();

  const isNameValid =
    albumName.trim().length >= MIN_NAME_LENGTH &&
    albumName.trim().length <= MAX_NAME_LENGTH;

  const handleContinue = () => {
    if (!isNameValid) return;

    createAlbum(
      {
        albumName: albumName.trim(),
        eventType: selectedEventType,
        language: i18n.language,
      },
      {
        onSuccess: (album) => {
          router.replace(`/photo-upload/${album.event_token}`);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>{t('createAlbum.albumNameLabel')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('createAlbum.albumNamePlaceholder')}
            placeholderTextColor={theme.colors.palette.neutral400}
            value={albumName}
            onChangeText={setAlbumName}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          <Text style={styles.sectionLabel}>{t('createAlbum.eventType.label')}</Text>
          <View style={styles.eventTypeList}>
            {EVENT_TYPES.map(({ value, labelKey }) => {
              const isSelected = selectedEventType === value;
              return (
                <Pressable
                  key={value}
                  style={[styles.eventTypeItem, isSelected && styles.eventTypeItemSelected]}
                  onPress={() => setSelectedEventType(value)}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]} />
                  <Text
                    style={[
                      styles.eventTypeLabel,
                      isSelected && styles.eventTypeLabelSelected,
                    ]}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error && (
            <Text style={styles.errorText}>{t('createAlbum.error')}</Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.continueButton, (!isNameValid || isPending) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!isNameValid || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>{t('createAlbum.continueButton')}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.screenPadding.horizontal,
    paddingTop: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.palette.neutral600,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  textInput: {
    ...theme.typography.body,
    color: theme.colors.text,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  eventTypeList: {
    gap: theme.spacing.xs,
  },
  eventTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  eventTypeItemSelected: {
    borderColor: theme.colors.tint,
    backgroundColor: theme.colors.palette.primary100,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    borderWidth: theme.borderWidth.medium,
    borderColor: theme.colors.border,
  },
  radioSelected: {
    borderColor: theme.colors.tint,
    backgroundColor: theme.colors.tint,
  },
  eventTypeLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  eventTypeLabelSelected: {
    color: theme.colors.tint,
    fontWeight: theme.fontWeight.medium,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
  },
  footer: {
    padding: theme.screenPadding.horizontal,
    paddingBottom: theme.spacing.md,
  },
  continueButton: {
    backgroundColor: theme.colors.tint,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...theme.typography.button,
    color: '#fff',
  },
});
