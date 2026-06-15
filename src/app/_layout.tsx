import { Stack } from "expo-router";
import { TransactionProvider } from "../context/TransactionContext";
import { useEffect } from "react";
import { initializeTables } from "../database/db";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    initializeTables();
  }, []);

  return (
    <SafeAreaProvider>
      <TransactionProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </TransactionProvider>
    </SafeAreaProvider>
  );
}
