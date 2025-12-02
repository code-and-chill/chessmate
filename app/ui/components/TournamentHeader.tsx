/**
 * TournamentHeader Component
 * app/ui/components/TournamentHeader.tsx
 */

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { useColors } from '../hooks/useThemeTokens';

type TournamentHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  title,
  subtitle,
  badge,
}) => {
  const colors = useColors();

  return (
    <Box
      padding={6}
      style={{
        backgroundColor: `${colors.accent.primary}0D`,
        borderBottomWidth: 1,
        borderBottomColor: `${colors.accent.primary}33`,
      }}
    >
      <Box gap={2}>
        <Box flexDirection="row" alignItems="center" gap={3}>
          <Text variant="title" weight="bold" color={colors.foreground.primary}>
            {title}
          </Text>
          {badge && (
            <Box padding={2} radius="sm" backgroundColor={colors.accent.primary}>
              <Text variant="caption" weight="semibold" color={colors.accentForeground.primary}>
                {badge}
              </Text>
            </Box>
          )}
        </Box>
        {subtitle && (
          <Text variant="body" color={colors.foreground.secondary}>
            {subtitle}
          </Text>
        )}
      </Box>
    </Box>
  );
};

TournamentHeader.displayName = 'TournamentHeader';
