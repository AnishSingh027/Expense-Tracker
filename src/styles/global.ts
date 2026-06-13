import { StyleSheet } from "react-native";
import { useTransactions } from "../context/TransactionContext";

import { darkColors, lightColors, colors } from "./colors";
export { darkColors, lightColors, colors };

export const getGlobalStyles = (themeColors: typeof darkColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
    padding: 20,
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: themeColors.border,
    shadowColor: themeColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: themeColors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: themeColors.textMuted,
    marginBottom: 20,
  },
  body: {
    fontSize: 14,
    color: themeColors.text,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: themeColors.textHighlight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  button: {
    backgroundColor: themeColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: themeColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 8,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: themeColors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: themeColors.inputBg,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: themeColors.text,
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: themeColors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
    marginVertical: 15,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: themeColors.border,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.card,
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: themeColors.text,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: themeColors.textMuted,
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: themeColors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: themeColors.primary,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: themeColors.inputBg,
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textMuted,
  },
  segmentTextActive: {
    color: themeColors.text,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: themeColors.border,
    margin: 5,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: themeColors.textMuted,
    marginLeft: 8,
  },
  categoryPillTextActive: {
    color: themeColors.text,
  },
});

// React Hook to consume the dynamic theme settings
export const useAppTheme = () => {
  const { theme } = useTransactions();
  const activeColors = theme === "dark" ? darkColors : lightColors;
  const activeStyles = getGlobalStyles(activeColors);

  return {
    colors: activeColors,
    styles: activeStyles,
  };
};

export const formatCurrency = (num: number): string => {
  try {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return num.toFixed(2);
  }
};
