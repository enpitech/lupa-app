import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('modal.title')}</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>{t('modal.goHome')}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  link: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.tint,
  },
});
