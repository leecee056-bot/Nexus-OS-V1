import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_THEME,
  THEMES,
  type ThemeColors,
  type ThemeId,
} from "./palettes";

const KEY_THEME = "nexus.companion.theme";
const KEY_SCAN = "nexus.companion.scanlines";

type ThemeContextValue = {
  themeId: ThemeId;
  colors: ThemeColors;
  setThemeId: (id: ThemeId) => void;
  scanlines: boolean;
  setScanlines: (on: boolean) => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);
  const [scanlines, setScanlinesState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [t, s] = await Promise.all([
          AsyncStorage.getItem(KEY_THEME),
          AsyncStorage.getItem(KEY_SCAN),
        ]);
        if (
          t === "basic" ||
          t === "matrix" ||
          t === "lumen" ||
          t === "terminal"
        ) {
          setThemeIdState(t);
        }
        if (s === "1") setScanlinesState(true);
        else if (s === "0") setScanlinesState(false);
        else if (t === "terminal") setScanlinesState(true);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    void AsyncStorage.setItem(KEY_THEME, id);
    if (id === "terminal") {
      setScanlinesState(true);
      void AsyncStorage.setItem(KEY_SCAN, "1");
    }
  }, []);

  const setScanlines = useCallback((on: boolean) => {
    setScanlinesState(on);
    void AsyncStorage.setItem(KEY_SCAN, on ? "1" : "0");
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      colors: THEMES[themeId],
      setThemeId,
      scanlines,
      setScanlines,
      ready,
    }),
    [themeId, setThemeId, scanlines, setScanlines, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeId: DEFAULT_THEME,
      colors: THEMES[DEFAULT_THEME],
      setThemeId: () => undefined,
      scanlines: false,
      setScanlines: () => undefined,
      ready: true,
    };
  }
  return ctx;
}
