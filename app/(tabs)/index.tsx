import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('home.title')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  text: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
});
