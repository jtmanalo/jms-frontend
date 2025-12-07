import { useState, useEffect } from 'react';
import { useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;

export default function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const getIsMobile = useCallback(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < breakpoint;
    return isMobileUA || isSmallScreen;
  }, [breakpoint]);

  const [isMobile, setIsMobile] = useState(getIsMobile());

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getIsMobile]);

  return isMobile;
}