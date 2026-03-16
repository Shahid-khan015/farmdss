import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

interface ResponsiveValues {
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  columns: 1 | 2 | 3;
}

export function useResponsive(): ResponsiveValues {
  const [dimensions, setDimensions] = useState<ResponsiveValues>(() => {
    const { width, height } = Dimensions.get('window');
    return getResponsiveValues(width, height);
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(getResponsiveValues(window.width, window.height));
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
}

function getResponsiveValues(width: number, height: number): ResponsiveValues {
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  let columns: 1 | 2 | 3 = 1;
  if (width >= 1024) columns = 3;
  else if (width >= 768) columns = 2;

  return {
    isPhone,
    isTablet,
    isDesktop,
    screenWidth: width,
    screenHeight: height,
    columns,
  };
}
