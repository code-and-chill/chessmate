/**
 * Tag Primitive Component (Badge/Chip)
 * app/ui/primitives/Tag.tsx
 * 
 * Theme-aware tag with semantic variants and sizes.
 * Compliance: 85% (theme-aware, semantic variants, size variants, dismissible)
 */

import { Pressable } from 'react-native';
import { Text } from './Text';
import { Box } from './Box';
import { useColors } from '../hooks/useThemeTokens';

type TagVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
type TagSize = 'sm' | 'md' | 'lg';
type TagStyle = 'filled' | 'outline';

type TagProps = {
  label: string;
  variant?: TagVariant;
  size?: TagSize;
  style?: TagStyle;
  onDismiss?: () => void;
};

const sizeMap = {
  sm: { padding: 1, fontSize: 'xs' as const },
  md: { padding: 2, fontSize: 'sm' as const },
  lg: { padding: 3, fontSize: 'base' as const },
};

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style = 'filled',
  onDismiss,
}) => {
  const colors = useColors();
  const sizeConfig = sizeMap[size];

  const variantColors = {
    default: { color: colors.accent.primary, bg: colors.accent.primary + '20' },
    success: { color: colors.success, bg: colors.success + '20' },
    error: { color: colors.error, bg: colors.error + '20' },
    warning: { color: colors.warning, bg: colors.warning + '20' },
    info: { color: colors.info, bg: colors.info + '20' },
  };

  const { color, bg } = variantColors[variant];

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      padding={sizeConfig.padding}
      radius="sm"
      backgroundColor={style === 'filled' ? bg : 'transparent'}
      borderWidth={style === 'outline' ? 1 : 0}
      borderColor={style === 'outline' ? color : undefined}
      gap={1}
    >
      <Text
        variant="label"
        weight="semibold"
        color={color}
        size={sizeConfig.fontSize}
      >
        {label}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={4}>
          <Text color={color} style={{ fontSize: 18, lineHeight: 18 }}>
            ×
          </Text>
        </Pressable>
      )}
    </Box>
  );
};

Tag.displayName = 'Tag';
