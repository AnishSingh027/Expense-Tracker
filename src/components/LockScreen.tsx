import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, lightColors } from "../styles/colors";
import { authorizedBiometrics } from "../utils/biometrics";

interface LockScreenProps {
  theme: "light" | "dark";
  passcode: string;
  biometricsEnabled: boolean;
  onUnlock: () => void;
}

const { width } = Dimensions.get("window");

export default function LockScreen({ theme, passcode, biometricsEnabled, onUnlock }: LockScreenProps) {
  const colors = theme === "dark" ? darkColors : lightColors;

  const [showPasscode, setShowPasscode] = useState(!biometricsEnabled);
  const [enteredPasscode, setEnteredPasscode] = useState("");

  const triggerAuth = async () => {
    const success = await authorizedBiometrics();
    if (success) {
      onUnlock();
    }
  };

  useEffect(() => {
    if (biometricsEnabled) {
      // Automatically trigger biometrics prompt on mount if active
      const initialAuth = async () => {
        const success = await authorizedBiometrics();
        if (success) {
          onUnlock();
        }
      };
      initialAuth();
    }
  }, [onUnlock, biometricsEnabled]);

  const handleKeyPress = (num: string) => {
    if (enteredPasscode.length >= 4) return;
    const newPasscode = enteredPasscode + num;
    setEnteredPasscode(newPasscode);

    if (newPasscode.length === 4) {
      // Check passcode from prop
      if (newPasscode === passcode) {
        onUnlock();
      } else {
        setTimeout(() => {
          Alert.alert("Incorrect Passcode", "Please try again.", [
            {
              text: "OK",
              onPress: () => setEnteredPasscode(""),
            },
          ]);
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    if (enteredPasscode.length > 0) {
      setEnteredPasscode(enteredPasscode.slice(0, -1));
    }
  };

  if (showPasscode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />

        <View style={styles.passcodeContainer}>
          <Text style={[styles.passcodeTitle, { color: colors.text }]}>
            Enter Passcode
          </Text>
          <Text style={[styles.passcodeSubtitle, { color: colors.textMuted }]}>
            Type your 4-digit PIN to unlock
          </Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: enteredPasscode.length > i ? colors.primary : "transparent",
                    borderColor: colors.border,
                    borderWidth: 1.5,
                  },
                ]}
              />
            ))}
          </View>

          {/* Keypad Grid */}
          <View style={styles.keypad}>
            <View style={styles.keypadRow}>
              {["1", "2", "3"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.keyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleKeyPress(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: colors.text }]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {["4", "5", "6"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.keyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleKeyPress(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: colors.text }]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {["7", "8", "9"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.keyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleKeyPress(num)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: colors.text }]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {biometricsEnabled ? (
                <TouchableOpacity
                  style={[styles.keyButton, styles.emptyKey]}
                  onPress={() => {
                    setEnteredPasscode("");
                    setShowPasscode(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.controlText, { color: colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.keyButton, styles.emptyKey]} />
              )}

              <TouchableOpacity
                style={[styles.keyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleKeyPress("0")}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, { color: colors.text }]}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.keyButton, styles.emptyKey]}
                onPress={handleBackspace}
                activeOpacity={0.7}
              >
                <Ionicons name="backspace-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      
      <View style={styles.content}>
        {/* Giant premium icon */}
        <View style={[styles.iconOuter, { borderColor: `${colors.primary}30` }]}>
          <View style={[styles.iconInner, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="lock-closed" size={60} color={colors.primary} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: colors.text }]}>
          Expense Tracker
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          App is secured. Authenticate to unlock.
        </Text>

        {/* Authenticate Actions Row */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={triggerAuth}
          >
            <Ionicons name="finger-print-outline" size={24} color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Biometric Unlock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buttonSecondary,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                marginTop: 15,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowPasscode(true)}
          >
            <Ionicons name="keypad-outline" size={20} color={colors.text} style={{ marginRight: 10 }} />
            <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>Enter PIN Passcode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionsContainer: {
    width: "100%",
    marginTop: 10,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 30,
    width: "100%",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "100%",
    borderWidth: 1.5,
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Passcode Styles
  passcodeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
  },
  passcodeTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  passcodeSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 40,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 50,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  keypad: {
    width: "100%",
    gap: 15,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  keyButton: {
    width: width * 0.2,
    height: width * 0.2,
    maxWidth: 75,
    maxHeight: 75,
    borderRadius: (width * 0.2) / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyKey: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  keyText: {
    fontSize: 26,
    fontWeight: "700",
  },
  controlText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
