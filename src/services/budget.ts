import { db } from "../database/db";

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
}

export const setBudget = async (budget: Omit<Budget, "id">) => {
  const database = await db;
  const result = await database.runAsync(
    "INSERT INTO budgets (amount, month, year) VALUES (?, ?, ?)",
    [budget.amount, budget.month, budget.year]
  );
  return result;
};

export const getBudget = async (): Promise<Budget[]> => {
  const database = await db;
  const rows = await database.getAllAsync<{ id: number; amount: number; month: number; year: number }>(
    "SELECT * FROM budgets"
  );
  return rows.map(row => ({
    id: String(row.id),
    amount: row.amount,
    month: row.month,
    year: row.year,
  }));
};

export const updateBudget = async (budget: Budget) => {
  const database = await db;
  const result = await database.runAsync(
    "UPDATE budgets SET amount = ?, month = ?, year = ? WHERE id = ?",
    [budget.amount, budget.month, budget.year, budget.id]
  );
  return result;
};
