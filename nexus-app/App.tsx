import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { VaultScreen } from "./src/screens/VaultScreen";
import { FilesScreen } from "./src/screens/FilesScreen";
import { AboutScreen } from "./src/screens/AboutScreen";
import { colors } from "./src/theme";

const Tab = createBottomTabNavigator();

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

function TabLabel({
  label,
  focused,
}: {
  label: string;
  focused: boolean;
}) {
  return (
    <Text
      style={{
        color: focused ? colors.accent : colors.fgDim,
        fontSize: 11,
        fontWeight: focused ? "700" : "400",
      }}
    >
      {label}
    </Text>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bgBar },
          headerTintColor: colors.accent,
          headerTitleStyle: { fontWeight: "700" },
          tabBarStyle: {
            backgroundColor: colors.bgBar,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.fgDim,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "NEXUS Companion",
            tabBarLabel: ({ focused }) => (
              <TabLabel label="Home" focused={focused} />
            ),
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="Chat" focused={focused} />
            ),
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Vault"
          component={VaultScreen}
          options={{
            title: "Knowledge Vault",
            tabBarLabel: ({ focused }) => (
              <TabLabel label="Vault" focused={focused} />
            ),
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Files"
          component={FilesScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="Files" focused={focused} />
            ),
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="About" focused={focused} />
            ),
            tabBarIcon: () => null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
