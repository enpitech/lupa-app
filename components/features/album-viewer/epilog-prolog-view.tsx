import { theme } from '@/constants/theme';
import type { EpilogPrologData } from '@/services/api/fetch-epilog-prolog';
import { StyleSheet, Text, View } from 'react-native';

type EpilogPrologViewProps = {
  data: EpilogPrologData;
  width: number;
};

export function EpilogPrologView({ data, width }: EpilogPrologViewProps) {
  const isRTL = data.direction === 'RTL';
  // The page is half the spread width (single page)
  const pageWidth = width / 2;
  const pageHeight = pageWidth * 1.4; // approximate page ratio

  return (
    <View style={[styles.container, { width }]}>
      <View
        style={[
          styles.page,
          {
            width: pageWidth,
            height: pageHeight,
            backgroundColor: data.bg_color || theme.colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: data.font_color || '#000',
              fontSize: data.font_size ? data.font_size * 0.5 : 14,
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {data.text_str}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  page: {
    padding: 24,
    justifyContent: 'center',
  },
  text: {
    lineHeight: 24,
  },
});
