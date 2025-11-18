/**
 * Avatar Primitive Component
 * app/ui/primitives/Avatar.tsx
 */

import { View } from 'react-native';
import { Text } from './Text';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  textColor?: string;
};

const sizeMap = {
  sm: { size: 32, fontSize: 'xs' as const },
  md: { size: 44, fontSize: 'base' as const },
  lg: { size: 56, fontSize: 'lg' as const },
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  backgroundColor = '#3B82F6',
  textColor = '#FFFFFF',
}) => {
  const config = sizeMap[size];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text variant="label" weight="bold" color={textColor} size={config.fontSize}>
        {initials}
      </Text>
    </View>
  );
};

Avatar.displayName = 'Avatar';
