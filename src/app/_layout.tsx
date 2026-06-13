import { Stack } from "expo-router";
import { TransactionProvider } from "../context/TransactionContext";
import { useEffect } from "react";
import { initializeTables } from "../database/db";

export default function RootLayout() {
  useEffect(() => {
    initializeTables();
  }, []);

  return (
    <TransactionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TransactionProvider>
  );
}
