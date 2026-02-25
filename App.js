import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, Text } from "react-native";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

import { MoodProvider } from "./context/MoodContext";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import InsightScreen from "./screens/InsightScreen";

const Tab = createBottomTabNavigator();

// Komponen icon tab
function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

export default function App() {
  useEffect(() => {
    // Handler saat user TAP notifikasi (app sedang background/closed)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notifikasi di-tap:", response);
        // Di sini kamu bisa navigate ke screen tertentu
        // misalnya langsung buka HomeScreen untuk catat mood
      },
    );

    // Cleanup: hapus listener saat App component unmount
    return () => subscription.remove();
  }, []);

  return (
    // SafeAreaProvider harus membungkus seluruh app
    <SafeAreaProvider>
      {/* MoodProvider membungkus NavigatorContainer agar semua screen dapat context */}
      <MoodProvider>
        <StatusBar barStyle={"dark-content"} backgroundColor={"#F8F9FA"} />

        {/* NavigationContainer adalah root dari semua navigasi */}
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false, //Sembunyikan header default
              tabBarStyle: {
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor: "#F0F0F0",
                paddingTop: 8,
                paddingBottom: 8,
                height: 64,
              },
              tabBarActiveTintColor: "#6C63FF",
              tabBarInactiveTintColor: "#9E9E9E",
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
                marginTop: 2,
              },
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: "Hari ini",
                tabBarIcon: ({ focused }) => (
                  <TabIcon emoji="😊" focused={focused} />
                ),
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarLabel: "Histori",
                tabBarIcon: ({ focused }) => (
                  <TabIcon emoji="📅" focused={focused} />
                ),
              }}
            />
            <Tab.Screen
              name="Insight"
              component={InsightScreen}
              options={{
                tabBarLabel: "Insights",
                tabBarIcon: ({ focused }) => (
                  <TabIcon emoji="📊" focused={focused} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </MoodProvider>
    </SafeAreaProvider>
  );
}
