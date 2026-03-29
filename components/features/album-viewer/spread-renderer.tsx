import { theme } from '@/constants/theme';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type SpreadRendererProps = {
  currentIndex: number;
  screenWidth: number;
  renderItem: (index: number) => React.ReactNode;
};

export function SpreadRenderer({
  currentIndex,
  screenWidth,
  renderItem,
}: SpreadRendererProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: theme.timing.quick });
  }, [currentIndex]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: screenWidth }]}>
      <Animated.View style={[StyleSheet.absoluteFill, fadeStyle]}>
        <View style={[styles.content, { width: screenWidth }]}>
          {renderItem(currentIndex)}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
