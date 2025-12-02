/**
 * Responsive Hooks
 * app/ui/hooks/useResponsive.ts
 * 
 * React hooks for responsive behavior
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  getCurrentBreakpoint,
  isBreakpoint,
  deviceType,
  getGridColumns,
  getContainerMaxWidth,
  getSpacingMultiplier,
  responsive as responsiveUtil,
} from '../tokens/breakpoints';
import type { Breakpoint } from '../tokens/breakpoints';

/**
 * Hook to get current breakpoint with live updates
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint());

  useEffect(() => {
    const handleChange = ({ window }: { window: ScaledSize }) => {
      setBreakpoint(getCurrentBreakpoint());
    };

    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription?.remove();
  }, []);

  return breakpoint;
};

/**
 * Hook to check if screen matches a breakpoint
 */
export const useMediaQuery = () => {
  const [queries, setQueries] = useState(isBreakpoint);

  useEffect(() => {
    const handleChange = () => {
      setQueries({ ...isBreakpoint });
    };

    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription?.remove();
  }, []);

  return queries;
};

/**
 * Hook to get device type
 */
export const useDeviceType = () => {
  const [device, setDevice] = useState({
    isMobile: deviceType.isMobile(),
    isTablet: deviceType.isTablet(),
    isDesktop: deviceType.isDesktop(),
    isWeb: deviceType.isWeb(),
  });

  useEffect(() => {
    const handleChange = () => {
      setDevice({
        isMobile: deviceType.isMobile(),
        isTablet: deviceType.isTablet(),
        isDesktop: deviceType.isDesktop(),
        isWeb: deviceType.isWeb(),
      });
    };

    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription?.remove();
  }, []);

  return device;
};

/**
 * Hook to get responsive value
 */
export const useResponsive = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const breakpoint = useBreakpoint();
  const [value, setValue] = useState<T | undefined>(responsiveUtil(values));

  useEffect(() => {
    setValue(responsiveUtil(values));
  }, [breakpoint, values]);

  return value;
};

/**
 * Hook to get grid columns
 */
export const useGridColumns = () => {
  const breakpoint = useBreakpoint();
  const [columns, setColumns] = useState(getGridColumns());

  useEffect(() => {
    setColumns(getGridColumns());
  }, [breakpoint]);

  return columns;
};

/**
 * Hook to get container max width
 */
export const useContainerMaxWidth = () => {
  const breakpoint = useBreakpoint();
  const [maxWidth, setMaxWidth] = useState(getContainerMaxWidth());

  useEffect(() => {
    setMaxWidth(getContainerMaxWidth());
  }, [breakpoint]);

  return maxWidth;
};

/**
 * Hook to get spacing multiplier
 */
export const useSpacingMultiplier = () => {
  const breakpoint = useBreakpoint();
  const [multiplier, setMultiplier] = useState(getSpacingMultiplier());

  useEffect(() => {
    setMultiplier(getSpacingMultiplier());
  }, [breakpoint]);

  return multiplier;
};

/**
 * Hook to get screen dimensions
 */
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const handleChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => subscription?.remove();
  }, []);

  return dimensions;
};
