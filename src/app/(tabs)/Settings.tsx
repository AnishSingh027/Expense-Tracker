import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, useAppTheme, darkColors } from "../../styles/global";
import { useTransactions } from "../../context/TransactionContext";
import { resetAllTables } from "../../database/reset-table";
import { useRouter } from "expo-router";

export default function Settings() {
  const router = useRouter();
  const {
    transactions,
    budgetLimit,
    updateBudgetLimit,
    theme: currentTheme,
    setTheme,
    biometricsEnabled,
    setBiometricsEnabled,
    passcode,
    setPasscode,
    passcodeEnabled,
    setPasscodeEnabled,
  } = useTransactions();
  const { colors, styles: globalStyles } = useAppTheme();
  const localStyles = getLocalStyles(colors);

  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState(String(budgetLimit));

  // Passcode Modal States
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [newPasscodeText, setNewPasscodeText] = useState("");
  const [confirmPasscodeText, setConfirmPasscodeText] = useState("");

  const handleOpenPasscodeModal = () => {
    setNewPasscodeText("");
    setConfirmPasscodeText("");
    setShowPasscodeModal(true);
  };

  const handleSavePasscode = async () => {
    if (!/^\d{4}$/.test(newPasscodeText)) {
      Alert.alert(
        "Invalid PIN",
        "Passcode must be a 4-digit number (e.g. 1234)."
      );
      return;
    }

    if (newPasscodeText !== confirmPasscodeText) {
      Alert.alert(
        "PIN Mismatch",
        "The entered passcodes do not match. Please verify and try again."
      );
      return;
    }

    try {
      await setPasscode(newPasscodeText);
      setShowPasscodeModal(false);
      Alert.alert("PIN Updated 🎉", "Your application security passcode has been successfully updated.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update passcode in database settings.");
    }
  };

  // Auto-populated Month & Year
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const handleOpenBudgetModal = () => {
    setNewBudget(String(budgetLimit));
    setShowBudgetModal(true);
  };

  // Statistics
  const totalTransactionsCount = transactions.length;
  const totalExpensesAmount = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncomeAmount = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleSaveBudget = async () => {
    const parsed = parseFloat(newBudget);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert(
        "Invalid Budget",
        "Please enter a valid budget amount greater than 0.",
      );
      return;
    }

    try {
      await updateBudgetLimit(parsed);
      setShowBudgetModal(false);
      Alert.alert(
        "Budget Set 🎉",
        `Monthly budget for ${currentMonthName} ${currentYear} has been set to ₹${formatCurrency(parsed)}`,
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update the budget limit in database.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data ⚠️",
      "Are you sure you want to delete all transaction history, custom budgets, and settings? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Data",
          style: "destructive",
          onPress: async () => {
            try {
              await resetAllTables();
              Alert.alert(
                "Data Wiped",
                "Your transactions and budgets have been fully cleared.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate to index to refresh the blank state
                      router.replace("/(tabs)");
                    },
                  },
                ],
              );
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to reset database tables.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={globalStyles.container}>
          {/* Header */}
          <Text style={globalStyles.title}>Settings</Text>
          <Text style={globalStyles.subtitle}>Configure your preferences</Text>

          {/* Budget Limit Card */}
          <Text style={[globalStyles.label, { marginTop: 15 }]}>
            Active Budget
          </Text>
          <View style={globalStyles.card}>
            <View style={[globalStyles.row, { marginBottom: 12 }]}>
              <View>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  Limit for {currentMonthName} {currentYear}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 24,
                    fontWeight: "800",
                    marginTop: 4,
                  }}
                >
                  ₹{formatCurrency(budgetLimit)}
                </Text>
              </View>
              <View
                style={[
                  globalStyles.badge,
                  {
                    backgroundColor: `${colors.success}20`,
                    borderColor: colors.success,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    globalStyles.badgeText,
                    { color: colors.success, fontSize: 11 },
                  ]}
                >
                  Active
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                globalStyles.button,
                { marginVertical: 0, flexDirection: "row", gap: 8 },
              ]}
              activeOpacity={0.8}
              onPress={handleOpenBudgetModal}
            >
              <Ionicons name="options-outline" size={18} color={colors.text} />
              <Text style={globalStyles.buttonText}>Set Monthly Budget</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Theme & Preferences Section */}
          <Text style={[globalStyles.label, { marginTop: 20 }]}>
            Preferences
          </Text>
          <View style={[globalStyles.card, { paddingVertical: 10 }]}>
            {/* Theme Selector */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                App Theme
              </Text>
              <View style={localStyles.themeContainer}>
                {(["light", "dark"] as const).map((theme) => {
                  const isActive = currentTheme === theme;
                  const iconName =
                    theme === "light" ? "sunny-outline" : "moon-outline";
                  return (
                    <TouchableOpacity
                      key={theme}
                      style={[
                        localStyles.themeButton,
                        isActive && {
                          backgroundColor: `${colors.primary}20`,
                          borderColor: colors.primary,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setTheme(theme)}
                    >
                      <Ionicons
                        name={iconName}
                        size={16}
                        color={isActive ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={[
                          localStyles.themeText,
                          isActive && {
                            color: colors.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {theme.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Passcode Lock Switch */}
            <View
              style={[
                globalStyles.row,
                {
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Passcode Lock
                </Text>
              </View>
              <Switch
                value={passcodeEnabled}
                onValueChange={(val) => {
                  setPasscodeEnabled(val);
                  if (val && !passcode) {
                    // Open modal immediately to let them set passcode if not set yet
                    handleOpenPasscodeModal();
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={passcodeEnabled ? colors.text : colors.textMuted}
              />
            </View>

            {/* If passcode lock is active, show change pin and biometric options */}
            {passcodeEnabled && (
              <>
                {/* Fingerprint Biometrics Switch */}
                <View
                  style={[
                    globalStyles.row,
                    {
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                  >
                    <Ionicons
                      name="finger-print-outline"
                      size={20}
                      color={colors.accent}
                    />
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Biometric Unlock
                    </Text>
                  </View>
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={setBiometricsEnabled}
                    trackColor={{ false: colors.border, true: colors.accent }}
                    thumbColor={biometricsEnabled ? colors.text : colors.textMuted}
                  />
                </View>

                {/* Change Passcode Row */}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                >
                  <TouchableOpacity
                    style={[globalStyles.row, { width: "100%" }]}
                    activeOpacity={0.7}
                    onPress={handleOpenPasscodeModal}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                    >
                      <Ionicons
                        name="keypad-outline"
                        size={20}
                        color={colors.textHighlight}
                      />
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 15,
                          fontWeight: "600",
                        }}
                      >
                        Change PIN Passcode
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                        {passcode ? "••••" : "Not Set"}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Database System Stats */}
          <Text style={[globalStyles.label, { marginTop: 20 }]}>
            System Statistics
          </Text>
          <View style={globalStyles.card}>
            <View style={[globalStyles.row, { paddingVertical: 6 }]}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                Transactions Count
              </Text>
              <Text
                style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}
              >
                {totalTransactionsCount}
              </Text>
            </View>
            <View
              style={[
                globalStyles.row,
                {
                  paddingVertical: 6,
                  borderTopWidth: 1,
                  borderTopColor: `${colors.border}50`,
                  marginTop: 6,
                },
              ]}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                Total Monthly Income
              </Text>
              <Text
                style={{
                  color: colors.success,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                ₹{formatCurrency(totalIncomeAmount)}
              </Text>
            </View>
            <View
              style={[
                globalStyles.row,
                {
                  paddingVertical: 6,
                  borderTopWidth: 1,
                  borderTopColor: `${colors.border}50`,
                  marginTop: 6,
                },
              ]}
            >
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                Total Monthly Outflow
              </Text>
              <Text
                style={{
                  color: colors.secondary,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                -₹{formatCurrency(totalExpensesAmount)}
              </Text>
            </View>
          </View>

          {/* Data & Security */}
          <Text style={[globalStyles.label, { marginTop: 20 }]}>
            Data & Security
          </Text>
          {/* <TouchableOpacity
            style={[
              globalStyles.buttonSecondary,
              { borderColor: colors.primary },
            ]}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Export Data",
                "Your transaction data will be exported as a CSV report.",
              )
            }
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <Ionicons name="download-outline" size={18} color={colors.text} />
              <Text style={globalStyles.buttonText}>Export CSV Report</Text>
            </View>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[
              globalStyles.buttonSecondary,
              { borderColor: colors.error, marginTop: 10 },
            ]}
            activeOpacity={0.7}
            onPress={handleClearData}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[globalStyles.buttonText, { color: colors.error }]}>
                Clear All Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Set PIN Passcode Modal */}
      <Modal visible={showPasscodeModal} transparent animationType="fade">
        <TouchableOpacity
          style={localStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPasscodeModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              globalStyles.card,
              {
                width: "90%",
                padding: 24,
                borderWidth: 1.5,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[globalStyles.row, { marginBottom: 20 }]}>
              <Text
                style={[globalStyles.title, { fontSize: 20, marginBottom: 0 }]}
              >
                Set PIN Passcode
              </Text>
              <TouchableOpacity
                style={{
                  padding: 4,
                  borderRadius: 20,
                  backgroundColor: colors.inputBg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
                onPress={() => setShowPasscodeModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* New Passcode Input */}
            <Text style={globalStyles.label}>New 4-Digit PIN</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Enter new 4-digit PIN"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={newPasscodeText}
              onChangeText={setNewPasscodeText}
              autoFocus
            />

            {/* Confirm Passcode Input */}
            <Text style={[globalStyles.label, { marginTop: 12 }]}>Confirm PIN</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Re-enter PIN to confirm"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={confirmPasscodeText}
              onChangeText={setConfirmPasscodeText}
            />

            {/* Modal Save button */}
            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 20, backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={handleSavePasscode}
            >
              <Text style={globalStyles.buttonText}>Save Passcode</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Set Monthly Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="slide">
        <TouchableOpacity
          style={localStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBudgetModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              globalStyles.card,
              {
                width: "90%",
                padding: 24,
                borderWidth: 1.5,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[globalStyles.row, { marginBottom: 20 }]}>
              <Text
                style={[globalStyles.title, { fontSize: 20, marginBottom: 0 }]}
              >
                Set Budget Limit
              </Text>
              <TouchableOpacity
                style={{
                  padding: 4,
                  borderRadius: 20,
                  backgroundColor: colors.inputBg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
                onPress={() => setShowBudgetModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Read-Only Month Input */}
            <Text style={globalStyles.label}>Month</Text>
            <View style={[globalStyles.input, localStyles.disabledInput]}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                {currentMonthName}
              </Text>
            </View>

            {/* Read-Only Year Input */}
            <Text style={[globalStyles.label, { marginTop: 12 }]}>Year</Text>
            <View style={[globalStyles.input, localStyles.disabledInput]}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>
                {currentYear}
              </Text>
            </View>

            {/* Budget Limit Input */}
            <Text style={[globalStyles.label, { marginTop: 12 }]}>
              Budget Limit (₹)
            </Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Enter limit amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={newBudget}
              onChangeText={setNewBudget}
              autoFocus
            />

            {/* Modal Save button */}
            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 20 }]}
              activeOpacity={0.8}
              onPress={handleSaveBudget}
            >
              <Text style={globalStyles.buttonText}>Save Budget</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const getLocalStyles = (themeColors: typeof darkColors) =>
  StyleSheet.create({
    themeContainer: {
      flexDirection: "row",
      backgroundColor: themeColors.inputBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.border,
      padding: 3,
      marginTop: 5,
    },
    themeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    themeText: {
      fontSize: 12,
      fontWeight: "600",
      color: themeColors.textMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "center",
      alignItems: "center",
    },
    disabledInput: {
      backgroundColor: `${themeColors.border}40`,
      borderColor: themeColors.border,
      justifyContent: "center",
    },
  });
