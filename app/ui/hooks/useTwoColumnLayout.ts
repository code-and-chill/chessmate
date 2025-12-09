import { useMemo } from 'react';
import { useBreakpoint } from '@/ui/hooks/useResponsive';

export function useTwoColumnLayout() {
  const bp = useBreakpoint();
  const isTwoColumn = useMemo(() => bp === 'lg' || bp === 'xl' || bp === 'xxl', [bp]);
  return { isTwoColumn } as const;
}

