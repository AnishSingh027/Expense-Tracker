import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Transaction,
  getTransactionsFromDB,
  addTransactionToDB,
  updateTransactionInDB,
  deleteTransactionFromDB,
} from "../services/transaction";
import { getBudget, setBudget, updateBudget } from "../services/budget";
import { initializeTables } from "../database/db";
import { getSetting, updateSetting } from "../services/setting";
import LockScreen from "../components/LockScreen";

export { Transaction };

interface TransactionContextType {
  transactions: Transaction[];
  budgetLimit: number;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => Promise<void>;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  passcode: string;
  setPasscode: (newPasscode: string) => Promise<void>;
  passcodeEnabled: boolean;
  setPasscodeEnabled: (enabled: boolean) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (
    id: string,
    updatedFields: Partial<Omit<Transaction, "id">>,
  ) => Promise<void>;
  updateBudgetLimit: (limit: number) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [biometricsEnabled, setBiometricsEnabledState] = useState<boolean>(false);
  const [passcode, setPasscodeState] = useState<string>("");
  const [passcodeEnabled, setPasscodeEnabledState] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  // Load transactions and budget limit from SQLite DB on mount
  useEffect(() => {
    const initAndLoad = async () => {
      try {
        await initializeTables();
        const dbTxs = await getTransactionsFromDB();
        setTransactions(dbTxs);

        // Load budget for the current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const budgets = await getBudget();
        const activeBudget = budgets.find(
          (b) => b.month === currentMonth && b.year === currentYear,
        );
        if (activeBudget) {
          setBudgetLimit(activeBudget.amount);
        }

        // Load active theme and biometric settings using service
        const settingsObj = await getSetting();
        setThemeState(settingsObj.theme === "light" ? "light" : "dark");
        const isBiometricOn = settingsObj.biometric === "true";
        setBiometricsEnabledState(isBiometricOn);
        setPasscodeState(settingsObj.passcode || "");
        const isPasscodeOn = settingsObj.passcodeEnabled === "true";
        setPasscodeEnabledState(isPasscodeOn);
        setSettingsLoaded(true);

        if (isPasscodeOn) {
          setIsUnlocked(false);
        } else {
          setIsUnlocked(true);
        }
      } catch (err) {
        console.error("Failed to load data from SQLite:", err);
        setSettingsLoaded(true);
        setIsUnlocked(true);
      }
    };
    initAndLoad();
  }, []);

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    try {
      const newTx = await addTransactionToDB(tx);
      setTransactions((prev) => [newTx, ...prev]);
    } catch (err) {
      console.error("Failed to add transaction to SQLite:", err);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteTransactionFromDB(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err) {
      console.error("Failed to delete transaction from SQLite:", err);
    }
  };

  const updateTransaction = async (
    id: string,
    updatedFields: Partial<Omit<Transaction, "id">>,
  ) => {
    try {
      await updateTransactionInDB(id, updatedFields);
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx)),
      );
    } catch (err) {
      console.error("Failed to update transaction in SQLite:", err);
    }
  };

  const updateBudgetLimit = async (limit: number) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const budgets = await getBudget();
      const existing = budgets.find(
        (b) => b.month === currentMonth && b.year === currentYear,
      );

      if (existing) {
        await updateBudget({
          id: existing.id,
          amount: limit,
          month: currentMonth,
          year: currentYear,
        });
      } else {
        await setBudget({
          amount: limit,
          month: currentMonth,
          year: currentYear,
        });
      }
      setBudgetLimit(limit);
    } catch (err) {
      console.error("Failed to update budget in SQLite:", err);
    }
  };

  const setTheme = async (newTheme: "light" | "dark") => {
    try {
      const settingsObj = await getSetting();
      await updateSetting(newTheme, settingsObj.biometric, settingsObj.passcode, settingsObj.passcodeEnabled);
      setThemeState(newTheme);
    } catch (err) {
      console.error("Failed to update theme in SQLite:", err);
      setThemeState(newTheme);
    }
  };

  const setBiometricsEnabled = async (enabled: boolean) => {
    try {
      const settingsObj = await getSetting();
      const newBiometricStr = enabled ? "true" : "false";
      await updateSetting(settingsObj.theme, newBiometricStr, settingsObj.passcode, settingsObj.passcodeEnabled);
      setBiometricsEnabledState(enabled);
    } catch (err) {
      console.error("Failed to update biometric setting in SQLite:", err);
      setBiometricsEnabledState(enabled);
    }
  };

  const setPasscode = async (newPasscode: string) => {
    try {
      const settingsObj = await getSetting();
      await updateSetting(settingsObj.theme, settingsObj.biometric, newPasscode, settingsObj.passcodeEnabled);
      setPasscodeState(newPasscode);
    } catch (err) {
      console.error("Failed to update passcode in SQLite:", err);
      setPasscodeState(newPasscode);
    }
  };

  const setPasscodeEnabled = async (enabled: boolean) => {
    try {
      const settingsObj = await getSetting();
      const newEnabledStr = enabled ? "true" : "false";
      const finalPasscode = (enabled && !settingsObj.passcode) ? "1234" : settingsObj.passcode;
      await updateSetting(settingsObj.theme, settingsObj.biometric, finalPasscode, newEnabledStr);
      if (finalPasscode) {
        setPasscodeState(finalPasscode);
      }
      setPasscodeEnabledState(enabled);
    } catch (err) {
      console.error("Failed to update passcode enabled setting in SQLite:", err);
      setPasscodeEnabledState(enabled);
    }
  };

  if (!settingsLoaded) {
    return null;
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        budgetLimit,
        theme,
        setTheme,
        biometricsEnabled,
        setBiometricsEnabled,
        passcode,
        setPasscode,
        passcodeEnabled,
        setPasscodeEnabled,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        updateBudgetLimit,
      }}
    >
      {passcodeEnabled && !isUnlocked ? (
        <LockScreen
          theme={theme}
          passcode={passcode}
          biometricsEnabled={biometricsEnabled}
          onUnlock={() => setIsUnlocked(true)}
        />
      ) : (
        children
      )}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider",
    );
  }
  return context;
};
