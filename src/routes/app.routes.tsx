import { Platform } from "react-native";
import { useTheme } from "native-base";
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";

import HomeSvg from "@assets/bus-icon.svg";
import LineSvg from "@assets/map-icon.svg";

import { Home } from "@screens/Home";
import { Line } from "@screens/Line";
import { LineCard } from "@screens/LineCard";
import { Hours } from "@screens/Hours";

type AppRoutes = {
  home: undefined;
  line: undefined;
  lineCard: {
    lineId: number;
  };
  hours: undefined;
}; //exportando tipagem especifica

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {
  const { sizes, colors } = useTheme();

  const iconSize = sizes[6];

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.gray[700],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          height: Platform.OS === "android" ? "auto" : 96,
          paddingBottom: sizes[10],
          paddingTop: sizes[6],
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
          tabBarHideOnKeyboard: true,
        }}
      />

      <Screen
        name="line"
        component={Line}
        options={{
          tabBarIcon: ({ color }) => (
            <LineSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
        // initialParams={{line: String}}
      />

      <Screen
        name="lineCard"
        component={LineCard}
        options={{ tabBarButton: () => null }}
        initialParams={{lineId: undefined}}
      />

      <Screen
        name="hours"
        component={Hours}
        options={{ tabBarButton: () => null }}
      />
    </Navigator>
  );
}
