import { useState, useEffect, useCallback } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Tailwind CSS default breakpoints
const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook for responsive design that offers various breakpoint utilities
 */
export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints: BreakpointConfig = {
    ...DEFAULT_BREAKPOINTS,
    ...customBreakpoints,
  };

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Update window width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize with current width

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get current breakpoint
  const getCurrentBreakpoint = useCallback((): Breakpoint => {
    if (windowWidth < breakpoints.sm) return 'xs';
    if (windowWidth < breakpoints.md) return 'sm';
    if (windowWidth < breakpoints.lg) return 'md';
    if (windowWidth < breakpoints.xl) return 'lg';
    if (windowWidth < breakpoints['2xl']) return 'xl';
    return '2xl';
  }, [windowWidth, breakpoints]);

  // Check if the current viewport is at least the given breakpoint
  const isMin = useCallback(
    (breakpoint: Breakpoint): boolean => {
      return windowWidth >= breakpoints[breakpoint];
    },
    [windowWidth, breakpoints]
  );

  // Check if the current viewport is smaller than the given breakpoint
  const isMax = useCallback(
    (breakpoint: Breakpoint): boolean => {
      return windowWidth < breakpoints[breakpoint];
    },
    [windowWidth, breakpoints]
  );

  // Check if the current viewport is between two breakpoints
  const isBetween = useCallback(
    (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean => {
      return (
        windowWidth >= breakpoints[minBreakpoint] &&
        windowWidth < breakpoints[maxBreakpoint]
      );
    },
    [windowWidth, breakpoints]
  );

  // Computed properties
  const isMobile = windowWidth < breakpoints.md;
  const isTablet = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isDesktop = windowWidth >= breakpoints.lg;
  const currentBreakpoint = getCurrentBreakpoint();

  return {
    windowWidth,
    currentBreakpoint,
    isMin,
    isMax,
    isBetween,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
}

export default useResponsive;
