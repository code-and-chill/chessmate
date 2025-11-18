/**
 * Tag Primitive Component (Badge/Chip)
 * app/ui/primitives/Tag.tsx
 */

import { Text } from './Text';
import { Box } from './Box';

type TagProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
  variant?: 'filled' | 'outline';
};

export const Tag: React.FC<TagProps> = ({
  label,
  color = '#3B82F6',
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  variant = 'filled',
}) => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      padding={2}
      radius="sm"
      backgroundColor={variant === 'filled' ? backgroundColor : 'transparent'}
      borderWidth={variant === 'outline' ? 1 : 0}
      borderColor={variant === 'outline' ? color : undefined}
    >
      <Text variant="label" weight="semibold" color={color}>
        {label}
      </Text>
    </Box>
  );
};

Tag.displayName = 'Tag';
