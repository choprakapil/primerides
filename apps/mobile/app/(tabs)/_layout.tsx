import React from "react";
import { Tabs } from "expo-router";
import { Car, CalendarCheck, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#737373",
        tabBarStyle: {
          backgroundColor: "#0d0d0d",
          borderTopColor: "#1f1f1f",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: "#0d0d0d",
          borderBottomColor: "#1f1f1f",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Prime Fleet",
          tabBarIcon: ({ color, size }) => <Car color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "My Rides",
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size || 22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size || 22} />,
        }}
      />
    </Tabs>
  );
}
