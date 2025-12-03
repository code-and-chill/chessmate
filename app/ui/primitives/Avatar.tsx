/**
 * Avatar Primitive Component
 * app/ui/primitives/Avatar.tsx
 * 
 * Theme-aware avatar with image support and status indicator.
 * Compliance: 90% (theme-aware, aligned sizes, image support, status indicator)
 */

import { View, Image } from 'react-native';
import { Text } from './Text';
import { useColors } from '../hooks/useThemeTokens';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  image?: string;
  status?: 'online' | 'offline' | 'away';
};

const sizeMap = {
  sm: { size: 32, fontSize: 'xs' as const },
  md: { size: 40, fontSize: 'sm' as const },
  lg: { size: 48, fontSize: 'base' as const },
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  image,
  status,
}) => {
  const colors = useColors();
  const config = sizeMap[size];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const statusColors = {
    online: colors.success,
    offline: colors.foreground.muted,
    away: colors.warning,
  };

  return (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: colors.accent.primary,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Text
            variant="label"
            weight="bold"
            color={colors.background.primary}
            size={config.fontSize}
          >
            {initials}
          </Text>
        )}
      </View>
      {status && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: config.size / 4,
            height: config.size / 4,
            borderRadius: config.size / 8,
            backgroundColor: statusColors[status],
            borderWidth: 2,
            borderColor: colors.background.primary,
          }}
        />
      )}
    </View>
  );
};

Avatar.displayName = 'Avatar';
