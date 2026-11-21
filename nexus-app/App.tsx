import { useCallback, useMemo, useState, type ComponentType } from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { ImageScreen } from "./src/screens/ImageScreen";
import { VaultScreen } from "./src/screens/VaultScreen";
import { FilesScreen } from "./src/screens/FilesScreen";
import { PacksScreen } from "./src/screens/PacksScreen";
import { PluginsScreen } from "./src/screens/PluginsScreen";
import { AboutScreen } from "./src/screens/AboutScreen";
import { BootSplash } from "./src/components/BootSplash";
import { ScanlineOverlay } from "./src/components/ScanlineOverlay";
import { TabIcon } from "./src/components/TabIcon";
import { TerminalTitleBar } from "./src/components/TerminalTitleBar";
import { ThemePicker } from "./src/components/ThemePicker";
import { ThemeProvider, spacing, useTheme } from "./src/theme";
import { monoStyle } from "./src/theme/fonts";

type RootTabParamList = {
  Home: undefined;
  Chat: undefined;
  Image: undefined;
  Vault: undefined;
  Packs: undefined;
  Plugins: undefined;
  Files: undefined;
  About: undefined;
};

type ScreenName = keyof RootTabParamList;

const Tab = createBottomTabNavigator<RootTabParamList>();
const navRef = createNavigationContainerRef<RootTabParamList>();

/** Image Lab is desktop-first (Windows / Mac / web companion). */
const SHOW_IMAGE_LAB = Platform.OS === "web";

const BASE_SCREENS: {
  name: ScreenName;
  component: ComponentType;
  title: string;
}[] = [
  { name: "Home", component: HomeScreen, title: "NEXUS" },
  { name: "Chat", component: ChatScreen, title: "Chat" },
  { name: "Vault", component: VaultScreen, title: "Knowledge Vault" },
  { name: "Packs", component: PacksScreen, title: "Knowledge Packs" },
  { name: "Plugins", component: PluginsScreen, title: "Add-ons" },
  { name: "Files", component: FilesScreen, title: "Files" },
  { name: "About", component: AboutScreen, title: "About" },
];

const SCREENS: {
  name: ScreenName;
  component: ComponentType;
  title: string;
}[] = SHOW_IMAGE_LAB
  ? [
      BASE_SCREENS[0],
      BASE_SCREENS[1],
      { name: "Image", component: ImageScreen, title: "Image" },
      ...BASE_SCREENS.slice(2),
    ]
  : BASE_SCREENS;

function HeaderBrand() {
  const { colors } = useTheme();
  const terminal = colors.terminalShell;
  return (
    <View style={styles.headerBrand}>
      <Image
        source={require("./assets/brand/logo-mark.png")}
        style={styles.headerMark}
      />
      <Text
        style={[
          styles.headerTitle,
          { color: colors.accent },
          terminal ? monoStyle({ letterSpacing: 2 }) : null,
        ]}
      >
        NEXUS
      </Text>
    </View>
  );
}

function SideRail({
  routeName,
  onSelect,
}: {
  routeName: string;
  onSelect: (name: ScreenName) => void;
}) {
  const { colors } = useTheme();
  const isDesktop = Platform.OS === "web";
  const terminal = colors.terminalShell;

  return (
    <View
      style={[
        styles.rail,
        {
          backgroundColor: colors.bgBar,
          borderRightColor: colors.border,
        },
      ]}
    >
      <View style={styles.railBrand}>
        {terminal ? (
          <Image
            source={require("./assets/brand/logo-mark.png")}
            style={styles.railLogo}
          />
        ) : (
          <Image
            source={require("./assets/brand/nexus-rabbit-wizard.png")}
            style={styles.railMascot}
            resizeMode="contain"
          />
        )}
        <Text
          style={[
            styles.railTitle,
            { color: colors.accent },
            terminal ? monoStyle() : null,
          ]}
        >
          NEXUS
        </Text>
        <Text
          style={[
            styles.railSub,
            { color: colors.purple },
            terminal ? monoStyle() : null,
          ]}
        >
          OS
        </Text>
      </View>
      {SCREENS.map((s) => {
        const focused = routeName === s.name;
        return (
          <Pressable
            key={s.name}
            onPress={() => onSelect(s.name)}
            style={[
              styles.railItem,
              {
                borderColor: focused
                  ? colors.accent
                  : terminal
                    ? "transparent"
                    : "transparent",
                backgroundColor: focused
                  ? terminal
                    ? colors.accent
                    : colors.accentSoft
                  : "transparent",
                shadowColor: colors.accent,
                shadowOpacity: focused && !terminal ? 0.35 : 0,
              },
            ]}
          >
            <TabIcon name={s.name} focused={focused && !terminal} />
            <Text
              style={[
                {
                  color: focused
                    ? terminal
                      ? colors.bg
                      : colors.accent
                    : colors.fgDim,
                  fontWeight: focused ? "800" : "600",
                  textDecorationLine:
                    focused && !terminal ? "underline" : "none",
                },
                terminal ? monoStyle({ fontSize: 12 }) : null,
              ]}
            >
              {s.name}
            </Text>
          </Pressable>
        );
      })}
      {isDesktop ? (
        <View style={styles.railTheme}>
          <ThemePicker compact />
        </View>
      ) : null}
    </View>
  );
}

function AppShell() {
  const [booting, setBooting] = useState(true);
  const [routeName, setRouteName] = useState("Home");
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600 || width >= 768;
  const finishBoot = useCallback(() => setBooting(false), []);
  const { colors, themeId } = useTheme();

  const navTheme = useMemo(() => {
    const base = themeId === "basic" ? DefaultTheme : DarkTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bgBar,
        text: colors.fg,
        border: colors.border,
        primary: colors.accent,
      },
    };
  }, [colors, themeId]);

  const terminal = colors.terminalShell;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <NavigationContainer
        ref={navRef}
        theme={navTheme}
        onStateChange={() => {
          const name = navRef.getCurrentRoute()?.name;
          if (name) setRouteName(name);
        }}
      >
        <StatusBar style={themeId === "basic" ? "dark" : "light"} />
        {terminal ? <TerminalTitleBar /> : null}
        <View style={styles.shell}>
          {isTablet ? (
            <SideRail
              routeName={routeName}
              onSelect={(name) => {
                if (navRef.isReady()) {
                  navRef.navigate(name);
                }
              }}
            />
          ) : null}
          <View style={styles.main}>
            <Tab.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.bgBar,
                  borderBottomColor: colors.border,
                  borderBottomWidth: 1,
                },
                headerTintColor: colors.accent,
                headerTitleStyle: [
                  { fontWeight: "700" },
                  terminal ? monoStyle({ fontSize: 14 }) : null,
                ],
                tabBarStyle: isTablet
                  ? { display: "none", height: 0 }
                  : {
                      backgroundColor: colors.bgBar,
                      borderTopColor: colors.border,
                      height: 58,
                      paddingBottom: 6,
                      paddingTop: 4,
                    },
                tabBarActiveTintColor: terminal ? colors.bg : colors.accent,
                tabBarInactiveTintColor: colors.fgDim,
                tabBarActiveBackgroundColor: terminal
                  ? colors.accent
                  : undefined,
                tabBarLabelStyle: [
                  { fontSize: 10, fontWeight: "600" },
                  terminal ? monoStyle({ fontSize: 9 }) : null,
                ],
              }}
            >
              {SCREENS.map((s) => (
                <Tab.Screen
                  key={s.name}
                  name={s.name}
                  component={s.component}
                  options={{
                    title: s.title,
                    headerTitle:
                      s.name === "Home" ? () => <HeaderBrand /> : undefined,
                    tabBarIcon: ({ focused }) => (
                      <TabIcon name={s.name} focused={focused} />
                    ),
                  }}
                />
              ))}
            </Tab.Navigator>
          </View>
        </View>
        <ScanlineOverlay />
      </NavigationContainer>
      {booting ? <BootSplash onDone={finishBoot} /> : null}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, flexDirection: "row" },
  main: { flex: 1 },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerMark: { width: 28, height: 28 },
  headerTitle: {
    fontWeight: "800",
    letterSpacing: 3,
    fontSize: 16,
  },
  rail: {
    width: 180,
    borderRightWidth: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  railBrand: { alignItems: "center", marginBottom: spacing.lg },
  railMascot: { width: 72, height: 112, marginBottom: spacing.sm },
  railLogo: { width: 56, height: 56, marginBottom: spacing.sm },
  railTitle: {
    fontWeight: "800",
    letterSpacing: 3,
  },
  railSub: { fontSize: 12, marginTop: 2, fontWeight: "700", letterSpacing: 2 },
  railItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 4,
    borderWidth: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  railTheme: {
    marginTop: "auto",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
