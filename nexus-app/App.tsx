import { useCallback, useState, type ComponentType } from "react";
import {
  NavigationContainer,
  DarkTheme,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { VaultScreen } from "./src/screens/VaultScreen";
import { FilesScreen } from "./src/screens/FilesScreen";
import { PacksScreen } from "./src/screens/PacksScreen";
import { AboutScreen } from "./src/screens/AboutScreen";
import { BootSplash } from "./src/components/BootSplash";
import { TabIcon } from "./src/components/TabIcon";
import { colors, spacing } from "./src/theme";

type RootTabParamList = {
  Home: undefined;
  Chat: undefined;
  Vault: undefined;
  Packs: undefined;
  Files: undefined;
  About: undefined;
};

type ScreenName = keyof RootTabParamList;

const Tab = createBottomTabNavigator<RootTabParamList>();
const navRef = createNavigationContainerRef<RootTabParamList>();

const SCREENS: {
  name: ScreenName;
  component: ComponentType;
  title: string;
}[] = [
  { name: "Home", component: HomeScreen, title: "NEXUS" },
  { name: "Chat", component: ChatScreen, title: "Chat" },
  { name: "Vault", component: VaultScreen, title: "Knowledge Vault" },
  { name: "Packs", component: PacksScreen, title: "Knowledge Packs" },
  { name: "Files", component: FilesScreen, title: "Files" },
  { name: "About", component: AboutScreen, title: "About" },
];

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgBar,
    text: colors.fg,
    border: colors.border,
    primary: colors.accent,
  },
};

function HeaderBrand() {
  return (
    <View style={styles.headerBrand}>
      <Image
        source={require("./assets/brand/logo-mark.png")}
        style={styles.headerMark}
      />
      <Text style={styles.headerTitle}>NEXUS</Text>
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
  return (
    <View style={styles.rail}>
      <View style={styles.railBrand}>
        <Image
          source={require("./assets/brand/nexus-rabbit-wizard.png")}
          style={styles.railMascot}
          resizeMode="contain"
        />
        <Text style={styles.railTitle}>NEXUS</Text>
        <Text style={styles.railSub}>Companion</Text>
      </View>
      {SCREENS.map((s) => {
        const focused = routeName === s.name;
        return (
          <Pressable
            key={s.name}
            onPress={() => onSelect(s.name)}
            style={[styles.railItem, focused && styles.railItemOn]}
          >
            <TabIcon name={s.name} focused={focused} />
            <Text
              style={[styles.railLabel, focused && styles.railLabelOn]}
            >
              {s.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [routeName, setRouteName] = useState("Home");
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600 || width >= 768;
  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <View style={styles.root}>
      <NavigationContainer
        ref={navRef}
        theme={navTheme}
        onStateChange={() => {
          const name = navRef.getCurrentRoute()?.name;
          if (name) setRouteName(name);
        }}
      >
        <StatusBar style="light" />
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
                headerTitleStyle: { fontWeight: "700" },
                tabBarStyle: isTablet
                  ? { display: "none", height: 0 }
                  : {
                      backgroundColor: colors.bgBar,
                      borderTopColor: colors.border,
                      height: 58,
                      paddingBottom: 6,
                      paddingTop: 4,
                    },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.fgDim,
                tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
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
      </NavigationContainer>
      {booting ? <BootSplash onDone={finishBoot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  shell: { flex: 1, flexDirection: "row" },
  main: { flex: 1 },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerMark: { width: 28, height: 28 },
  headerTitle: {
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 3,
    fontSize: 16,
  },
  rail: {
    width: 168,
    backgroundColor: colors.bgBar,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  railBrand: { alignItems: "center", marginBottom: spacing.lg },
  railMascot: { width: 72, height: 112, marginBottom: spacing.sm },
  railTitle: {
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 3,
  },
  railSub: { color: colors.purple, fontSize: 12, marginTop: 2 },
  railItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  railItemOn: {
    borderColor: colors.border,
    backgroundColor: colors.accentSoft,
  },
  railLabel: { color: colors.fgDim, fontWeight: "600" },
  railLabelOn: { color: colors.accent },
});
