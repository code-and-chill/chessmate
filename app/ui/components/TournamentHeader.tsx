/**
 * TournamentHeader Component
 * app/ui/components/TournamentHeader.tsx
 */

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

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
  return (
    <Box
      padding={6}
      backgroundColor="rgba(59, 130, 246, 0.05)"
      borderBottomWidth={1}
      borderColor="rgba(59, 130, 246, 0.2)"
    >
      <Box gap={2}>
        <Box flexDirection="row" alignItems="center" gap={3}>
          <Text variant="heading" weight="bold" color="#171717">
            {title}
          </Text>
          {badge && (
            <Box padding={2} radius="sm" backgroundColor="#3B82F6">
              <Text variant="caption" weight="semibold" color="#FAFAFA">
                {badge}
              </Text>
            </Box>
          )}
        </Box>
        {subtitle && (
          <Text variant="body" color="#737373">
            {subtitle}
          </Text>
        )}
      </Box>
    </Box>
  );
};

TournamentHeader.displayName = 'TournamentHeader';
