import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, useAppTheme } from "../../styles/global";
import { useTransactions, Transaction } from "../../context/TransactionContext";

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const { colors, styles: globalStyles } = useAppTheme();

  // Editing state hooks
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const categories = [
    { name: "Food", emoji: "☕", color: colors.warning },
    { name: "Shopping", emoji: "🛍️", color: colors.primary },
    { name: "Entertainment", emoji: "🍿", color: colors.accent },
    { name: "Travel", emoji: "🚗", color: colors.success },
    { name: "Utilities", emoji: "⚡", color: colors.info },
    { name: "Health", emoji: "💪", color: colors.secondary },
    { name: "Salary", emoji: "💼", color: colors.success },
    { name: "Side Hustle", emoji: "💻", color: colors.primary },
    { name: "Investments", emoji: "📈", color: colors.accent },
    { name: "Gifts", emoji: "🎁", color: colors.secondary },
    { name: "Other", emoji: "🔄", color: colors.textMuted },
  ];

  // Long press delete handler (1 second)
  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTransaction(id);
          },
        },
      ],
    );
  };

  // Open edit Modal
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(String(tx.amount));
    setEditCategory(tx.category);
  };

  // Save edited transaction
  const handleSaveEdit = () => {
    if (!editTitle) {
      Alert.alert("Error", "Please enter a note/title.");
      return;
    }
    if (
      !editAmount ||
      isNaN(parseFloat(editAmount)) ||
      parseFloat(editAmount) <= 0
    ) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    const matchedCategory = categories.find(
      (c) => c.name === editCategory,
    );

    updateTransaction(editingTx!.id, {
      title: editTitle,
      amount: parseFloat(editAmount),
      category: editCategory,
      emoji: matchedCategory?.emoji || editingTx!.emoji,
    });

    setEditingTx(null);
  };


  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={globalStyles.container}>
          {/* Header */}
          <Text style={globalStyles.title}>Transactions</Text>
          <Text style={globalStyles.subtitle}>
            Manage your logs and history
          </Text>

          {/* Delete Tip Note */}
          <View
            style={[
              globalStyles.card,
              {
                borderColor: `${colors.primary}30`,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
              },
            ]}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
            <Text
              style={[
                globalStyles.body,
                {
                  fontSize: 13,
                  color: colors.textHighlight || colors.textMuted,
                  flex: 1,
                },
              ]}
            >
              Tip: Long press any transaction to delete it from logs.
            </Text>
          </View>

          {/* Transaction List */}
          <View style={{ marginTop: 15 }}>
            {transactions.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 10 }}>🔍</Text>
                <Text style={[globalStyles.body, { color: colors.textMuted }]}>
                  No transactions found.
                </Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  style={globalStyles.transactionItem}
                  activeOpacity={0.8}
                  delayLongPress={500}
                  onLongPress={() => handleDelete(tx.id, tx.title)}
                >
                  {/* Category Emoji Container */}
                  <View
                    style={[
                      globalStyles.iconContainer,
                      {
                        backgroundColor: `${
                          categories.find((c) => c.name === tx.category)?.color || colors.textMuted
                        }20`,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{tx.emoji}</Text>
                  </View>

                  {/* Transaction Metadata */}
                  <View style={globalStyles.transactionDetails}>
                    <Text
                      style={globalStyles.transactionTitle}
                      numberOfLines={1}
                    >
                      {tx.title}
                    </Text>
                    <Text style={globalStyles.transactionSubtitle}>
                      {tx.category}
                    </Text>
                  </View>

                  {/* Amount and Action */}
                  <View
                    style={{
                      alignItems: "flex-end",
                      flexDirection: "row",
                      gap: 12,
                    }}
                  >
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          globalStyles.amountText,
                          {
                            color:
                              tx.type === "income"
                                ? colors.success
                                : colors.error,
                          },
                        ]}
                      >
                        {tx.type === "income" ? "+" : "-"}₹{formatCurrency(tx.amount)}
                      </Text>
                      <Text style={globalStyles.transactionSubtitle}>
                        {tx.date}
                      </Text>
                    </View>

                    {/* Edit Trigger Button */}
                    <TouchableOpacity
                      style={{
                        padding: 6,
                        backgroundColor: colors.inputBg,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                      activeOpacity={0.6}
                      onPress={() => handleOpenEdit(tx)}
                    >
                      <Ionicons
                        name="pencil"
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editingTx !== null} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setEditingTx(null)}
          >
            {/* Modal Card Content */}
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
                  style={[
                    globalStyles.title,
                    { fontSize: 20, marginBottom: 0 },
                  ]}
                >
                  Edit Transaction
                </Text>

                {/* Close Button (Top Right) */}
                <TouchableOpacity
                  style={{
                    padding: 4,
                    borderRadius: 20,
                    backgroundColor: colors.inputBg,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  activeOpacity={0.7}
                  onPress={() => setEditingTx(null)}
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Form Input fields */}
              <Text style={globalStyles.label}>Transaction Title</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Enter title"
                placeholderTextColor={colors.textMuted}
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={[globalStyles.label, { marginTop: 12 }]}>
                Amount (₹)
              </Text>
              <TextInput
                style={globalStyles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={editAmount}
                onChangeText={setEditAmount}
              />

              <Text
                style={[globalStyles.label, { marginTop: 12, marginBottom: 8 }]}
              >
                Category
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 15,
                }}
              >
                {categories
                  .filter((cat) => {
                    // Show only relevant categories matching transaction type
                    if (editingTx?.type === "expense") {
                      return [
                        "Food",
                        "Shopping",
                        "Entertainment",
                        "Travel",
                        "Utilities",
                        "Health",
                        "Other",
                      ].includes(cat.name);
                    } else {
                      return [
                        "Salary",
                        "Side Hustle",
                        "Investments",
                        "Gifts",
                        "Other",
                      ].includes(cat.name);
                    }
                  })
                  .map((cat) => {
                    const isSelected = editCategory === cat.name;
                    return (
                      <TouchableOpacity
                        key={cat.name}
                        style={[
                          globalStyles.categoryPill,
                          {
                            margin: 0,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                          },
                          isSelected && {
                            borderColor: cat.color,
                            backgroundColor: `${cat.color}20`,
                          },
                        ]}
                        activeOpacity={0.75}
                        onPress={() => setEditCategory(cat.name)}
                      >
                        <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                        <Text
                          style={[
                            globalStyles.categoryPillText,
                            isSelected && { color: colors.text },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>

              {/* Save changes action */}
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  {
                    backgroundColor:
                      editingTx?.type === "expense"
                        ? colors.secondary
                        : colors.success,
                    shadowColor:
                      editingTx?.type === "expense"
                        ? colors.secondary
                        : colors.success,
                    marginTop: 15,
                  },
                ]}
                activeOpacity={0.8}
                onPress={handleSaveEdit}
              >
                <Text style={globalStyles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
