import * as SQLite from "expo-sqlite";
import {
  CREATE_BUDGETS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
} from "./schema";

export const db = SQLite.openDatabaseAsync("expense.db");

export const initializeTables = async () => {
  const database = await db;
  
  // Safe schema check: check if budgets table has the old columns and drop if necessary
  try {
    const info = await database.getAllAsync<{ name: string }>("PRAGMA table_info(budgets)");
    const hasOldColumn = info.some(col => col.name === "totalExpense");
    if (hasOldColumn) {
      await database.execAsync("DROP TABLE IF EXISTS budgets");
    }
  } catch (err) {
    console.error("Failed to inspect budgets table info:", err);
  }

  // Safe schema check: check if settings table has the old notification column and drop if necessary
  try {
    const info = await database.getAllAsync<{ name: string }>("PRAGMA table_info(settings)");
    const hasNotification = info.some(col => col.name === "notification");
    if (hasNotification) {
      await database.execAsync("DROP TABLE IF EXISTS settings");
    } else if (info.length > 0) {
      const hasPasscode = info.some(col => col.name === "passcode");
      if (!hasPasscode) {
        await database.execAsync("ALTER TABLE settings ADD COLUMN passcode TEXT NOT NULL DEFAULT ''");
      }
      const hasPasscodeEnabled = info.some(col => col.name === "passcodeEnabled");
      if (!hasPasscodeEnabled) {
        await database.execAsync("ALTER TABLE settings ADD COLUMN passcodeEnabled TEXT NOT NULL DEFAULT 'false'");
      }
    }
  } catch (err) {
    console.error("Failed to inspect settings table info:", err);
  }

  await database.execAsync(CREATE_TRANSACTIONS_TABLE);
  await database.execAsync(CREATE_BUDGETS_TABLE);
  await database.execAsync(CREATE_SETTINGS_TABLE);
};

initializeTables();
