import { db } from "../database/db";

export interface Setting {
  id: string;
  theme: string;
  biometric: string;
  passcode: string;
  passcodeEnabled: string;
}

export const getSetting = async (): Promise<Setting> => {
  const database = await db;
  const rows = await database.getAllAsync<{ id: number; theme: string; biometric: string; passcode: string | null; passcodeEnabled: string }>(
    "SELECT * FROM settings LIMIT 1"
  );
  
  if (rows && rows.length > 0) {
    return {
      id: String(rows[0].id),
      theme: rows[0].theme,
      biometric: rows[0].biometric,
      passcode: rows[0].passcode || "",
      passcodeEnabled: rows[0].passcodeEnabled,
    };
  } else {
    // Default create with theme dark, biometric off ("false"), passcode empty ("") and passcodeEnabled off ("false")
    const result = await database.runAsync(
      "INSERT INTO settings (theme, biometric, passcode, passcodeEnabled) VALUES (?, ?, ?, ?)",
      ["dark", "false", "", "false"]
    );
    return {
      id: String(result.lastInsertRowId),
      theme: "dark",
      biometric: "false",
      passcode: "",
      passcodeEnabled: "false",
    };
  }
};

export const updateSetting = async (
  theme: string,
  biometric: string,
  passcode: string,
  passcodeEnabled: string
): Promise<void> => {
  const database = await db;
  const safePasscode = passcode || "";
  const result = await database.runAsync(
    "UPDATE settings SET theme = ?, biometric = ?, passcode = ?, passcodeEnabled = ?",
    [theme, biometric, safePasscode, passcodeEnabled]
  );
  if (result.changes === 0) {
    await database.runAsync(
      "INSERT INTO settings (theme, biometric, passcode, passcodeEnabled) VALUES (?, ?, ?, ?)",
      [theme, biometric, safePasscode, passcodeEnabled]
    );
  }
};
