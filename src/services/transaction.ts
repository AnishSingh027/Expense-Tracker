import { db } from "../database/db";

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  emoji: string;
}

// Helper database row structure
interface TransactionRow {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  note: string;
  date: string;
  time: string;
  emoji: string;
}

// Fetch all transactions from SQLite database
export const getTransactionsFromDB = async (): Promise<Transaction[]> => {
  const database = await db;
  const rows = await database.getAllAsync<TransactionRow>(
    "SELECT * FROM transactions ORDER BY id DESC"
  );
  
  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    amount: row.amount,
    type: row.type as "income" | "expense",
    category: row.category,
    date: row.date,
    emoji: row.emoji || "🛒",
  }));
};

// Add a transaction to SQLite database
export const addTransactionToDB = async (
  tx: Omit<Transaction, "id">
): Promise<Transaction> => {
  const database = await db;
  const result = await database.runAsync(
    "INSERT INTO transactions (title, amount, type, category, note, date, time, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      tx.title,
      tx.amount,
      tx.type,
      tx.category,
      tx.title, // use title as note
      tx.date,
      "", // time is formatted into the date string in UI
      tx.emoji || "🛒",
    ]
  );
  
  const insertId = result.lastInsertRowId;
  
  return {
    id: String(insertId),
    title: tx.title,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    date: tx.date,
    emoji: tx.emoji || "🛒",
  };
};

// Update a transaction in SQLite database
export const updateTransactionInDB = async (
  id: string,
  updatedFields: Partial<Omit<Transaction, "id">>
): Promise<void> => {
  const database = await db;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return;

  const existingRows = await database.getAllAsync<TransactionRow>(
    "SELECT * FROM transactions WHERE id = ?",
    [numericId]
  );
  if (existingRows.length === 0) return;
  const existing = existingRows[0];

  const title = updatedFields.title !== undefined ? updatedFields.title : existing.title;
  const amount = updatedFields.amount !== undefined ? updatedFields.amount : existing.amount;
  const type = updatedFields.type !== undefined ? updatedFields.type : existing.type;
  const category = updatedFields.category !== undefined ? updatedFields.category : existing.category;
  const date = updatedFields.date !== undefined ? updatedFields.date : existing.date;
  const emoji = updatedFields.emoji !== undefined ? updatedFields.emoji : existing.emoji;

  await database.runAsync(
    "UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, note = ?, date = ?, emoji = ? WHERE id = ?",
    [title, amount, type, category, title, date, emoji, numericId]
  );
};

// Delete a transaction from SQLite database
export const deleteTransactionFromDB = async (id: string): Promise<void> => {
  const database = await db;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return;
  await database.runAsync("DELETE FROM transactions WHERE id = ?", [numericId]);
};

