import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { formatCurrency, useAppTheme } from "../../styles/global";
import { useTransactions } from "../../context/TransactionContext";

interface ChartDataPoint {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const { transactions } = useTransactions();
  const { colors, styles: globalStyles } = useAppTheme();

  // Dynamic totals
  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Dynamic Pie Chart Data
  const expenseCategories = [
    "Food",
    "Shopping",
    "Entertainment",
    "Travel",
    "Utilities",
    "Health",
    "Misc",
  ];
  const expenseCategoryColors: { [key: string]: string } = {
    Food: colors.warning,
    Shopping: colors.primary,
    Entertainment: colors.accent,
    Travel: colors.success,
    Utilities: colors.info,
    Health: colors.secondary,
    Misc: colors.textMuted,
  };

  const expensePieData: ChartDataPoint[] = expenseCategories
    .map((catName) => {
      const amount = transactions
        .filter((tx) => tx.type === "expense" && tx.category === catName)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return {
        name: catName,
        amount,
        color: expenseCategoryColors[catName] || colors.textMuted,
        legendFontColor: colors.textMuted,
        legendFontSize: 11,
      };
    })
    .filter((item) => item.amount > 0);

  const incomeCategories = [
    "Salary",
    "Side Hustle",
    "Investments",
    "Gifts",
    "Other",
  ];
  const incomeCategoryColors: { [key: string]: string } = {
    Salary: colors.success,
    "Side Hustle": colors.primary,
    Investments: colors.accent,
    Gifts: colors.secondary,
    Other: colors.textMuted,
  };

  const incomePieData: ChartDataPoint[] = incomeCategories
    .map((catName) => {
      const amount = transactions
        .filter((tx) => tx.type === "income" && tx.category === catName)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return {
        name: catName,
        amount,
        color: incomeCategoryColors[catName] || colors.textMuted,
        legendFontColor: colors.textMuted,
        legendFontSize: 11,
      };
    })
    .filter((item) => item.amount > 0);

  // Dynamic Weekly Trend Calculation
  const getWeeklyAmounts = (type: "income" | "expense") => {
    const weeklyData = [0, 0, 0, 0];
    transactions
      .filter((tx) => tx.type === type)
      .forEach((tx) => {
        let day = 15; // default to mid-month
        if (tx.date.toLowerCase().includes("today")) {
          day = new Date().getDate();
        } else if (tx.date.toLowerCase().includes("yesterday")) {
          const yest = new Date();
          yest.setDate(yest.getDate() - 1);
          day = yest.getDate();
        } else {
          const match = tx.date.match(/[A-Za-z]+\s+(\d+)/);
          if (match && match[1]) {
            day = parseInt(match[1]);
          }
        }
        const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
        weeklyData[weekIndex] += tx.amount;
      });
    return weeklyData;
  };

  // Switch configuration
  const activeWeeklyData = getWeeklyAmounts(activeTab);
  const activePieData =
    activeTab === "expense" ? expensePieData : incomePieData;
  const totalAmount = activeTab === "expense" ? totalExpense : totalIncome;
  const themeColor =
    activeTab === "expense" ? colors.secondary : colors.success;


  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={globalStyles.container}>
          {/* Header */}
          <Text style={globalStyles.title}>Analytics</Text>
          <Text style={globalStyles.subtitle}>
            Statistical figures and breakdowns
          </Text>

          {/* Segment Control (Expense / Income Swapper) */}
          <View style={globalStyles.segmentContainer}>
            <TouchableOpacity
              style={[
                globalStyles.segmentButton,
                activeTab === "expense" && {
                  backgroundColor: `${colors.secondary}20`,
                  borderWidth: 1.5,
                  borderColor: colors.secondary,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveTab("expense")}
            >
              <Text
                style={[
                  globalStyles.segmentText,
                  activeTab === "expense" && [
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
                activeTab === "income" && {
                  backgroundColor: `${colors.success}20`,
                  borderWidth: 1.5,
                  borderColor: colors.success,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveTab("income")}
            >
              <Text
                style={[
                  globalStyles.segmentText,
                  activeTab === "income" && [
                    globalStyles.segmentTextActive,
                    { color: colors.success },
                  ],
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stat Overview Card */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.label}>
              {activeTab === "expense"
                ? "Total Monthly Outflow"
                : "Total Monthly Inflow"}
            </Text>
            <Text
              style={[
                globalStyles.title,
                {
                  fontSize: 36,
                  fontWeight: "900",
                  color: themeColor,
                  marginVertical: 8,
                },
              ]}
            >
              ₹{formatCurrency(totalAmount)}
            </Text>
            <Text
              style={[
                globalStyles.body,
                { color: colors.textMuted, fontSize: 13 },
              ]}
            >
              {activeTab === "expense"
                ? "📉 8% lower than average monthly spending"
                : "📈 14% higher than last month's salary inflow"}
            </Text>
          </View>

          {activePieData.length === 0 ? (
            <View
              style={[
                globalStyles.card,
                {
                  alignItems: "center",
                  paddingVertical: 50,
                  marginTop: 20,
                  borderColor: `${themeColor}20`,
                },
              ]}
            >
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "700",
                  fontSize: 18,
                  marginBottom: 6,
                }}
              >
                No Data Available
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  textAlign: "center",
                  paddingHorizontal: 20,
                  lineHeight: 18,
                }}
              >
                Log some {activeTab === "expense" ? "expenses" : "income"} in
                the Add tab to view your analytics breakdown!
              </Text>
            </View>
          ) : (
            <>
              {/* Weekly Trends BarChart Replacement */}
              <Text
                style={[globalStyles.label, { marginTop: 20, marginBottom: 8 }]}
              >
                Weekly Trends
              </Text>
              <View
                style={[
                  globalStyles.card,
                  {
                    paddingVertical: 20,
                    paddingHorizontal: 15,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    height: 240,
                  },
                ]}
              >
                {activeWeeklyData.map((val, idx) => {
                  const maxVal = Math.max(...activeWeeklyData, 1);
                  const barHeight = (val / maxVal) * 150; // Max height is 150
                  return (
                    <View
                      key={idx}
                      style={{
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      {/* Amount above bar */}
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 10,
                          fontWeight: "700",
                          marginBottom: 6,
                        }}
                      >
                        ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                      </Text>
                      {/* Visual Bar Column */}
                      <View
                        style={{
                          width: 32,
                          height: Math.max(barHeight, 6), // min height 6
                          backgroundColor: themeColor,
                          borderRadius: 8,
                          shadowColor: themeColor,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 5,
                          elevation: 3,
                        }}
                      />
                      {/* Week label */}
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 11,
                          fontWeight: "600",
                          marginTop: 8,
                        }}
                      >
                        W{idx + 1}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Category Share Segmented Bar Chart Replacement */}
              <Text
                style={[globalStyles.label, { marginTop: 20, marginBottom: 8 }]}
              >
                Category Distribution
              </Text>
              <View
                style={[
                  globalStyles.card,
                  {
                    paddingVertical: 20,
                    paddingHorizontal: 16,
                  },
                ]}
              >
                {/* Horizontal Segmented Bar */}
                <View
                  style={{
                    height: 18,
                    width: "100%",
                    backgroundColor: colors.border,
                    borderRadius: 9,
                    flexDirection: "row",
                    overflow: "hidden",
                    marginBottom: 20,
                  }}
                >
                  {activePieData.map((item, index) => {
                    const sharePercent = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                    return (
                      <View
                        key={index}
                        style={{
                          flex: sharePercent,
                          backgroundColor: item.color,
                          height: "100%",
                        }}
                      />
                    );
                  })}
                </View>

                {/* Legend list below */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "center",
                  }}
                >
                  {activePieData.map((item, index) => {
                    const sharePercent = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: item.color,
                          }}
                        />
                        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>
                          {item.name} ({sharePercent.toFixed(0)}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>


              {/* Category Progress List */}
              <Text
                style={[globalStyles.label, { marginTop: 20, marginBottom: 8 }]}
              >
                Share Breakdown
              </Text>
              <View style={{ gap: 10 }}>
                {activePieData.map((item, index) => {
                  const sharePercent =
                    totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                  return (
                    <View
                      key={index}
                      style={[
                        globalStyles.card,
                        { marginVertical: 0, padding: 16 },
                      ]}
                    >
                      <View style={[globalStyles.row, { marginBottom: 6 }]}>
                        <Text
                          style={{
                            color: colors.text,
                            fontWeight: "700",
                            fontSize: 15,
                          }}
                        >
                          {item.name}
                        </Text>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              color: colors.text,
                              fontWeight: "700",
                              fontSize: 15,
                            }}
                          >
                            ₹{formatCurrency(item.amount)}
                          </Text>
                          <Text
                            style={{
                              color: colors.textMuted,
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            {sharePercent.toFixed(1)}% Share
                          </Text>
                        </View>
                      </View>
                      {/* Visual Progress Bar Share */}
                      <View
                        style={[
                          globalStyles.progressBarContainer,
                          { height: 6, marginVertical: 4 },
                        ]}
                      >
                        <View
                          style={[
                            globalStyles.progressBarFill,
                            {
                              width: `${Math.min(sharePercent, 100)}%`,
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
