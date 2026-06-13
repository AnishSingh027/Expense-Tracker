import { db } from "./db";

const resetTransactionsTable = async () => {
  const database = await db;
  const result = await database.execAsync("DELETE FROM transactions");
  return result;
};

const resetBudgetsTable = async () => {
  const database = await db;
  const result = await database.execAsync("DELETE FROM budgets");
  return result;
};

const resetAllTables = async () => {
  await resetTransactionsTable();
  await resetBudgetsTable();
};

export { resetTransactionsTable, resetBudgetsTable, resetAllTables };
