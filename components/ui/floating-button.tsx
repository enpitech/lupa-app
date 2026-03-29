import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

type FloatingButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
  size?: number;
};

export function FloatingButton({
  icon,
  onPress,
  disabled = false,
  size = 40,
}: FloatingButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        disabled && styles.disabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={size * 0.5}
        color={disabled ? theme.colors.palette.neutral400 : theme.colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    ...theme.shadows.lg,
  },
  disabled: {
    opacity: 0.4,
  },
});
