export const CREATE_TRANSACTIONS_TABLE = `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    note TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    emoji TEXT
) `;

export const CREATE_BUDGETS_TABLE = `CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL
) `;

export const CREATE_SETTINGS_TABLE = `CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme TEXT NOT NULL,
    biometric TEXT NOT NULL,
    passcode TEXT NOT NULL DEFAULT '',
    passcodeEnabled TEXT NOT NULL DEFAULT 'false'
) `;
