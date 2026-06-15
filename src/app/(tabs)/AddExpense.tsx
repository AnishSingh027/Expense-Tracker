import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../styles/global";
import { useTransactions } from "../../context/TransactionContext";

interface CategoryOption {
  name: string;
  emoji: string;
  color: string;
}

export default function AddExpense() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { colors, styles: globalStyles } = useAppTheme();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Date and time picker states
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  });
  const [hour, setHour] = useState(() => {
    const now = new Date();
    let hrs = now.getHours();
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    return String(hrs);
  });
  const [minute, setMinute] = useState(() => {
    const now = new Date();
    const mins = now.getMinutes();
    const rounded = Math.round(mins / 5) * 5;
    const finalMins = rounded === 60 ? 55 : rounded;
    return String(finalMins).padStart(2, "0");
  });
  const [period, setPeriod] = useState<"AM" | "PM">(() => {
    const now = new Date();
    return now.getHours() >= 12 ? "PM" : "AM";
  });

  // Category and modal states
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [showHourModal, setShowHourModal] = useState(false);
  const [showMinuteModal, setShowMinuteModal] = useState(false);

  // Category list configurations
  const expenseCategories: CategoryOption[] = [
    { name: "Food", emoji: "☕", color: colors.warning },
    { name: "Shopping", emoji: "🛍️", color: colors.primary },
    { name: "Entertainment", emoji: "🍿", color: colors.accent },
    { name: "Travel", emoji: "🚗", color: colors.success },
    { name: "Utilities", emoji: "⚡", color: colors.info },
    { name: "Health", emoji: "💪", color: colors.secondary },
    { name: "Misc", emoji: "📁", color: colors.textMuted },
  ];

  const incomeCategories: CategoryOption[] = [
    { name: "Salary", emoji: "💼", color: colors.success },
    { name: "Side Hustle", emoji: "💻", color: colors.primary },
    { name: "Investments", emoji: "📈", color: colors.accent },
    { name: "Gifts", emoji: "🎁", color: colors.secondary },
    { name: "Other", emoji: "🔄", color: colors.textMuted },
  ];

  const activeCategories =
    type === "expense" ? expenseCategories : incomeCategories;

  const setTimeToCurrent = () => {
    const now = new Date();
    let hrs = now.getHours();
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    const mins = now.getMinutes();
    const rounded = Math.round(mins / 5) * 5;
    const finalMins = rounded === 60 ? 55 : rounded;

    setHour(String(hrs));
    setMinute(String(finalMins).padStart(2, "0"));
    setPeriod(ampm);
  };

  const handleTypeChange = (newType: "expense" | "income") => {
    setType(newType);
    if (newType === "expense") {
      setSelectedCategory("Food");
    } else {
      setSelectedCategory("Salary");
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0.",
      );
      return;
    }

    const categoryObj = activeCategories.find(
      (c) => c.name === selectedCategory,
    );
    const loggedTime = `${hour}:${minute} ${period}`;

    // Add to global state context
    addTransaction({
      title: note.trim() || `${selectedCategory} ${type === "expense" ? "Expense" : "Income"}`,
      amount: parseFloat(amount),
      category: selectedCategory,
      type,
      date: `${date}, ${loggedTime}`,
      emoji: categoryObj?.emoji || "🛒",
    });

    Alert.alert(
      "Success! 🎉",
      `Saved ${type === "expense" ? "Expense" : "Income"} of ₹${parseFloat(amount).toFixed(2)} for ${categoryObj?.emoji} ${selectedCategory} at ${loggedTime}.`,
      [
        {
          text: "OK",
          onPress: () => {
            // Reset fields
            setAmount("");
            setNote("");
            handleTypeChange(type); // Reset active category
            setTimeToCurrent();
            // Navigate to Activity log screen
            router.push("/Transactions");
          },
        },
      ],
    );
  };


  return (
    <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={globalStyles.container}>
            <Text style={globalStyles.title}>New Log</Text>
            <Text style={globalStyles.subtitle}>
              Log transactions dynamically
            </Text>

            {/* Segment Toggle between Expense and Income */}
            <View style={globalStyles.segmentContainer}>
              <TouchableOpacity
                style={[
                  globalStyles.segmentButton,
                  type === "expense" && {
                    backgroundColor: `${colors.secondary}20`,
                    borderWidth: 1.5,
                    borderColor: colors.secondary,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleTypeChange("expense")}
              >
                <Text
                  style={[
                    globalStyles.segmentText,
                    type === "expense" && [
                      globalStyles.segmentTextActive,
                      { color: colors.secondary },
                    ],
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  globalStyles.segmentButton,
                  type === "income" && {
                    backgroundColor: `${colors.success}20`,
                    borderWidth: 1.5,
                    borderColor: colors.success,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleTypeChange("income")}
              >
                <Text
                  style={[
                    globalStyles.segmentText,
                    type === "income" && [
                      globalStyles.segmentTextActive,
                      { color: colors.success },
                    ],
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hero Card for Centered Amount Input */}
            <View
              style={[
                globalStyles.card,
                { alignItems: "center", paddingVertical: 30 },
              ]}
            >
              <Text style={globalStyles.label}>Amount Value</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "800",
                    color: colors.textMuted,
                    marginRight: 8,
                  }}
                >
                  ₹
                </Text>
                <TextInput
                  style={{
                    fontSize: 48,
                    fontWeight: "900",
                    color:
                      type === "expense" ? colors.secondary : colors.success,
                    textAlign: "center",
                    minWidth: 180,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={`${colors.textMuted}50`}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  maxLength={10}
                />
              </View>
            </View>

            {/* Category selection */}
            <Text
              style={[globalStyles.label, { marginTop: 15, marginBottom: 8 }]}
            >
              Category
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -5,
              }}
            >
              {activeCategories.map((cat) => {
                const isActive = selectedCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      globalStyles.categoryPill,
                      isActive && {
                        borderColor: cat.color,
                        backgroundColor: `${cat.color}20`,
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleCategorySelect(cat.name)}
                  >
                    <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                    <Text
                      style={[
                        globalStyles.categoryPillText,
                        isActive && [
                          globalStyles.categoryPillTextActive,
                          { color: colors.text },
                        ],
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note & Date Details */}
            <Text style={[globalStyles.label, { marginTop: 20 }]}>
              Transaction Details
            </Text>

            <TextInput
              style={globalStyles.input}
              placeholder={`${type === "expense" ? "Expense note (e.g. coffee)" : "Income note (e.g. salary)"}`}
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              maxLength={40}
            />

            {/* Date input */}
            <TextInput
              style={[globalStyles.input, { opacity: 0.85, marginTop: 12 }]}
              placeholder="Date"
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
            />

            {/* Time selection row */}
            <View style={[globalStyles.row, { gap: 10, marginVertical: 10 }]}>
              {/* Hour Dropdown */}
              <TouchableOpacity
                style={[
                  globalStyles.input,
                  {
                    flex: 1,
                    marginVertical: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setShowHourModal(true)}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {hour} hr
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  ▾
                </Text>
              </TouchableOpacity>

              {/* Minute Dropdown */}
              <TouchableOpacity
                style={[
                  globalStyles.input,
                  {
                    flex: 1,
                    marginVertical: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setShowMinuteModal(true)}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {minute} min
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  ▾
                </Text>
              </TouchableOpacity>

              {/* AM/PM Toggle Button */}
              <TouchableOpacity
                style={[
                  globalStyles.input,
                  {
                    flex: 0.8,
                    marginVertical: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setPeriod(period === "AM" ? "PM" : "AM")}
              >
                <Text
                  style={{
                    color: colors.textHighlight,
                    fontSize: 16,
                    fontWeight: "800",
                  }}
                >
                  {period}
                </Text>
              </TouchableOpacity>

              {/* Set Current Button */}
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  {
                    marginVertical: 0,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    backgroundColor: colors.inputBg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowOpacity: 0,
                    elevation: 0,
                  },
                ]}
                activeOpacity={0.7}
                onPress={setTimeToCurrent}
              >
                <Text
                  style={[
                    globalStyles.buttonText,
                    { fontSize: 13, color: colors.textMuted },
                  ]}
                >
                  🕒 Now
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hour Picker Modal */}
            <Modal visible={showHourModal} transparent animationType="fade">
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={1}
                onPress={() => setShowHourModal(false)}
              >
                <View
                  style={[globalStyles.card, { width: "80%", padding: 20 }]}
                >
                  <Text
                    style={[
                      globalStyles.label,
                      { textAlign: "center", marginBottom: 15 },
                    ]}
                  >
                    Select Hour
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
                      (h) => (
                        <TouchableOpacity
                          key={h}
                          style={[
                            globalStyles.categoryPill,
                            {
                              margin: 0,
                              paddingHorizontal: 18,
                              paddingVertical: 12,
                              minWidth: 55,
                              alignItems: "center",
                              justifyContent: "center",
                            },
                            hour === h && {
                              borderColor: colors.primary,
                              backgroundColor: `${colors.primary}20`,
                            },
                          ]}
                          onPress={() => {
                            setHour(h);
                            setShowHourModal(false);
                          }}
                        >
                          <Text
                            style={{
                              color: colors.text,
                              fontWeight: "700",
                              fontSize: 16,
                            }}
                          >
                            {h}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Minute Picker Modal */}
            <Modal visible={showMinuteModal} transparent animationType="fade">
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                activeOpacity={1}
                onPress={() => setShowMinuteModal(false)}
              >
                <View
                  style={[globalStyles.card, { width: "85%", padding: 20 }]}
                >
                  <Text
                    style={[
                      globalStyles.label,
                      { textAlign: "center", marginBottom: 15 },
                    ]}
                  >
                    Select Minute
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    {[
                      "00",
                      "05",
                      "10",
                      "15",
                      "20",
                      "25",
                      "30",
                      "35",
                      "40",
                      "45",
                      "50",
                      "55",
                    ].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          globalStyles.categoryPill,
                          {
                            margin: 0,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            minWidth: 55,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                          minute === m && {
                            borderColor: colors.primary,
                            backgroundColor: `${colors.primary}20`,
                          },
                        ]}
                        onPress={() => {
                          setMinute(m);
                          setShowMinuteModal(false);
                        }}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            fontWeight: "700",
                            fontSize: 16,
                          }}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                globalStyles.button,
                {
                  backgroundColor:
                    type === "expense" ? colors.secondary : colors.success,
                  shadowColor:
                    type === "expense" ? colors.secondary : colors.success,
                  marginTop: 25,
                },
              ]}
              activeOpacity={0.8}
              onPress={handleSave}
            >
              <Text style={globalStyles.buttonText}>Save Transaction</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
