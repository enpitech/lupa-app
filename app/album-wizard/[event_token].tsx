import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { fetchAlbumThemes } from '@/services/api/fetch-album-themes';
import type { AlbumTheme, AlbumThemeDesign } from '@/services/api/fetch-album-themes';
import { fetchBookFormats } from '@/services/api/fetch-book-formats';
import type { BookCover, BookFormat } from '@/services/api/fetch-book-formats';
import { fetchCloseAlbum } from '@/services/api/fetch-close-album';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlbumWizardScreen() {
  const { event_token } = useLocalSearchParams<{ event_token: string }>();
  const { t, i18n } = useTranslation();

  const direction = i18n.language === 'he' ? 'RTL' : 'LTR';

  const [selectedFormatId, setSelectedFormatId] = useState('');
  const [selectedCoverId, setSelectedCoverId] = useState('');
  const [selectedDensityId, setSelectedDensityId] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const {
    data: formatsData,
    isLoading: formatsLoading,
    isError: formatsError,
  } = useQuery({
    queryKey: ['bookFormats', event_token, i18n.language],
    queryFn: () => fetchBookFormats({ eventToken: event_token, lang: i18n.language }),
    enabled: !!event_token,
  });

  const {
    data: themesData,
    isLoading: themesLoading,
  } = useQuery({
    queryKey: ['albumThemes', event_token, selectedCoverId, direction, i18n.language],
    queryFn: () =>
      fetchAlbumThemes({
        eventToken: event_token,
        format: selectedCoverId,
        direction,
        lang: i18n.language,
      }),
    enabled: !!event_token && !!selectedCoverId,
  });

  // Auto-select defaults when formats load
  useEffect(() => {
    if (!formatsData || selectedFormatId) return;
    const defaultFmt =
      formatsData.formats.find((f) => f.format_default) ?? formatsData.formats[0];
    if (!defaultFmt) return;
    setSelectedFormatId(defaultFmt.id);
    const firstCover = defaultFmt.covers[0];
    if (firstCover) {
      setSelectedCoverId(firstCover.id);
      setSelectedDensityId(firstCover.densities[0]?.id ?? 'normal');
    }
  }, [formatsData, selectedFormatId]);

  // Auto-select first theme when themes load
  useEffect(() => {
    if (!themesData || selectedThemeId) return;
    const firstTheme = getFirstTheme(themesData);
    if (firstTheme) setSelectedThemeId(firstTheme.id);
  }, [themesData, selectedThemeId]);

  const formats = formatsData?.formats ?? [];
  const selectedFormat = formats.find((f) => f.id === selectedFormatId) ?? formats[0];
  const covers = selectedFormat?.covers ?? [];
  const allThemes = themesData ? flattenThemes(themesData) : [];

  const handleSelectFormat = (fmt: BookFormat) => {
    setSelectedFormatId(fmt.id);
    const firstCover = fmt.covers[0];
    if (firstCover) {
      setSelectedCoverId(firstCover.id);
      setSelectedDensityId(firstCover.densities[0]?.id ?? 'normal');
    }
    setSelectedThemeId(''); // reset theme when format changes
  };

  const handleSelectCover = (cover: BookCover) => {
    setSelectedCoverId(cover.id);
    setSelectedDensityId(cover.densities[0]?.id ?? 'normal');
    setSelectedThemeId(''); // reset theme when cover changes
  };

  const handleCreate = async () => {
    if (!event_token || !selectedCoverId || !selectedThemeId || isCreating) return;
    setIsCreating(true);
    setCreateError('');
    try {
      await fetchCloseAlbum({
        eventToken: event_token,
        lang: i18n.language,
        format: selectedCoverId,
        density: selectedDensityId,
        direction,
        album_theme: selectedThemeId,
        is_cover_edited: false,
        flipbook_new: true,
      });
      router.replace(`/album/${event_token}`);
    } catch {
      setCreateError(t('wizard.error'));
      setIsCreating(false);
    }
  };

  const isLoading = formatsLoading;
  const canCreate = !!selectedCoverId && !!selectedThemeId && !isCreating;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (formatsError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Format section */}
        <Text style={styles.sectionLabel}>{t('wizard.formatSection')}</Text>
        <FlatList
          data={formats}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const selected = item.id === selectedFormatId;
            return (
              <Pressable
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => handleSelectFormat(item)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item.title}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Cover section */}
        {covers.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{t('wizard.coverSection')}</Text>
            {covers.map((cover) => {
              const selected = cover.id === selectedCoverId;
              return (
                <Pressable
                  key={cover.id}
                  style={[styles.radioRow, selected && styles.radioRowSelected]}
                  onPress={() => handleSelectCover(cover)}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                  <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
                    {cover.title_button || cover.title}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )}

        {/* Theme section */}
        <Text style={styles.sectionLabel}>{t('wizard.themeSection')}</Text>
        {themesLoading ? (
          <ActivityIndicator style={styles.themesLoader} />
        ) : (
          <FlatList
            data={allThemes}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            renderItem={({ item }) => {
              const selected = item.id === selectedThemeId;
              return (
                <Pressable
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setSelectedThemeId(item.id)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item.displayName}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
        <Pressable
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate}
        >
          {isCreating ? (
            <View style={styles.creatingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.createButtonText}>{t('wizard.creating')}</Text>
            </View>
          ) : (
            <Text style={styles.createButtonText}>{t('wizard.createButton')}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function flattenThemes(designs: AlbumThemeDesign[]): AlbumTheme[] {
  return designs.flatMap((d) => d.categories.flatMap((c) => c.themes));
}

function getFirstTheme(designs: AlbumThemeDesign[]): AlbumTheme | undefined {
  return flattenThemes(designs)[0];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.screenPadding.horizontal,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.palette.neutral600,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipSelected: {
    borderColor: theme.colors.tint,
    backgroundColor: theme.colors.palette.primary100,
  },
  chipText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.tint,
    fontWeight: theme.fontWeight.medium,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth.thin,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  radioRowSelected: {
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
  radioLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  radioLabelSelected: {
    color: theme.colors.tint,
    fontWeight: theme.fontWeight.medium,
  },
  themesLoader: {
    marginVertical: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.palette.neutral500,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  footer: {
    padding: theme.screenPadding.horizontal,
    paddingBottom: theme.spacing.md,
  },
  createButton: {
    backgroundColor: theme.colors.tint,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    ...theme.typography.button,
    color: '#fff',
  },
  creatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
