import { useWindowDimensions } from "react-native";

/** Phone vs tablet / desktop companion chrome */
export function useCompanionLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600 || width >= 768;
  const isWide = width >= 900;
  const contentMax = isWide ? 920 : isTablet ? 720 : undefined;
  const gutter = isTablet ? 28 : 16;
  const heroMascot = isTablet ? { w: 160, h: 250 } : { w: 110, h: 170 };
  return { width, height, isTablet, isWide, contentMax, gutter, heroMascot };
}
