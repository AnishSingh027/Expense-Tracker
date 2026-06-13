import React from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { formatCurrency, useAppTheme } from "../../styles/global";
import { useTransactions } from "../../context/TransactionContext";

export default function Dashboard() {
  const router = useRouter();
  const { transactions, budgetLimit } = useTransactions();
  const { colors, styles: globalStyles } = useAppTheme();

  // Dynamic calculations
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingBalance = totalIncome - totalExpense;
  const spentPercent = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;

  const categoryColors: { [key: string]: string } = {
    Food: colors.warning,
    Shopping: colors.primary,
    Entertainment: colors.accent,
    Travel: colors.success,
    Utilities: colors.info,
    Health: colors.secondary,
    Salary: colors.success,
    "Side Hustle": colors.primary,
    Investments: colors.accent,
    Gifts: colors.secondary,
    Misc: colors.textMuted,
    Other: colors.textMuted,
  };

  const categoryDetails = [
    { name: "Food", emoji: "☕", color: colors.warning },
    { name: "Shopping", emoji: "🛍️", color: colors.primary },
    { name: "Entertainment", emoji: "🍿", color: colors.accent },
    { name: "Travel", emoji: "🚗", color: colors.success },
    { name: "Utilities", emoji: "⚡", color: colors.info },
    { name: "Health", emoji: "💪", color: colors.secondary },
    { name: "Misc", emoji: "📁", color: colors.textMuted },
  ];

  const categoryExpenses = categoryDetails.map((cat) => {
    const spent = transactions
      .filter((tx) => tx.type === "expense" && tx.category === cat.name)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      ...cat,
      spent,
    };
  });


  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={globalStyles.container}>
          <View style={globalStyles.card}>
            <Text style={globalStyles.label}>Remaining Balance</Text>
            <Text
              style={[
                globalStyles.title,
                { fontSize: 38, fontWeight: "900", marginBottom: 20 },
              ]}
            >
              ₹{formatCurrency(remainingBalance)}
            </Text>

            {/* Income & Expense Breakdown */}
            <View style={[globalStyles.row, { marginBottom: 15 }]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    globalStyles.label,
                    { color: colors.success, fontSize: 11 },
                  ]}
                >
                  Total Income
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  +₹{formatCurrency(totalIncome)}
                </Text>
              </View>
              <View
                style={{
                  width: 1,
                  height: 35,
                  backgroundColor: colors.border,
                  marginHorizontal: 15,
                }}
              />
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text
                  style={[
                    globalStyles.label,
                    { color: colors.error, fontSize: 11 },
                  ]}
                >
                  Total Expense
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  -₹{formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>

            {/* Overall Monthly Budget Progress Bar */}
            <View style={{ marginTop: 10 }}>
              <View style={[globalStyles.row, { marginBottom: 4 }]}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  Monthly Spent Limit
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.textHighlight,
                  }}
                >
                  {spentPercent.toFixed(1)}% Spent
                </Text>
              </View>
              <View style={globalStyles.progressBarContainer}>
                <View
                  style={[
                    globalStyles.progressBarFill,
                    {
                      width: `${Math.min(spentPercent, 100)}%`,
                      backgroundColor: colors.secondary,
                    },
                  ]}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  textAlign: "right",
                }}
              >
                out of ₹{formatCurrency(budgetLimit)}
              </Text>
            </View>
          </View>


          {/* Category Expenses Grid */}
          <View style={[globalStyles.row, { marginTop: 15, marginBottom: 8 }]}>
            <Text style={globalStyles.label}>Category Expenses</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            style={{
              marginHorizontal: -20,
              paddingHorizontal: 20,
              marginBottom: 10,
            }}
          >
            {categoryExpenses.map((cat, idx) => {
              return (
                <View
                  key={idx}
                  style={[
                    globalStyles.card,
                    { width: 125, marginVertical: 0, padding: 12, alignItems: "center" },
                  ]}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: `${cat.color}15`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.textMuted,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: colors.text,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    ₹{formatCurrency(cat.spent)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Recent Activity List */}
          <View style={[globalStyles.row, { marginTop: 20, marginBottom: 10 }]}>
            <Text style={globalStyles.label}>Recent Transactions</Text>
            <TouchableOpacity activeOpacity={0.6} onPress={() => router.push("/Transactions")}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction items (slice to 5 max for Dashboard) */}
          {transactions.length === 0 ? (
            <View style={{ alignItems: "center", marginVertical: 20 }}>
              <Text style={[globalStyles.body, { color: colors.textMuted }]}>
                No transactions yet. Add your first log!
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <TouchableOpacity
                key={tx.id}
                style={globalStyles.transactionItem}
                activeOpacity={0.75}
                onPress={() => router.push("/Transactions")}
              >
                <View
                  style={[
                    globalStyles.iconContainer,
                    { backgroundColor: `${categoryColors[tx.category] || colors.textMuted}20` },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{tx.emoji}</Text>
                </View>

                <View style={globalStyles.transactionDetails}>
                  <Text style={globalStyles.transactionTitle} numberOfLines={1}>
                    {tx.title}
                  </Text>
                  <Text style={globalStyles.transactionSubtitle}>
                    {tx.category}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      globalStyles.amountText,
                      {
                        color:
                          tx.type === "income" ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {tx.type === "income" ? "+" : "-"}₹{formatCurrency(tx.amount)}
                  </Text>
                  <Text style={globalStyles.transactionSubtitle}>{tx.date}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

