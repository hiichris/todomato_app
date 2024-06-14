import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from "expo-sqlite";
import { Todo } from "../models/todo";


export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  if (currentDbVersion >= DATABASE_VERSION) {
    currentDbVersion = 0; // Reset the database for now
    //return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS todos; 
CREATE TABLE todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER)
`);
    await db.runAsync(
      "INSERT INTO todos (value, intValue) VALUES (?, ?)",
      "hello",
      1
    );
    await db.runAsync(
      "INSERT INTO todos (value, intValue) VALUES (?, ?)",
      "world",
      2
    );
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}


export async function getAllTodoItems(db: SQLiteDatabase) {
  const query = "SELECT * FROM todos"
  return await db.getAllAsync<Todo>(query);
}