import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/stores/authStore";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync().catch(() => {});

const luxuryTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#f59e0b", // Amber 500
    background: "#080808",
    card: "#121212",
    text: "#ffffff",
    border: "#222222",
  },
};

export default function RootLayout() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession().finally(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, [restoreSession]);

  return (
    <ThemeProvider value={luxuryTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0d0d0d" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#080808" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="car/[slug]"
          options={{
            title: "Vehicle Details",
            headerBackTitle: "Fleet",
          }}
        />
        <Stack.Screen
          name="account/login"
          options={{
            presentation: "modal",
            title: "Sign In",
            headerStyle: { backgroundColor: "#121212" },
          }}
        />
        <Stack.Screen
          name="account/register"
          options={{
            presentation: "modal",
            title: "Create Account",
            headerStyle: { backgroundColor: "#121212" },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
