import {
  SQLiteProvider,
  useSQLiteContext,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
// import * as SQLite from 'expo-sqlite';
import { Todo } from "../models/todo";

const todos_db = "todos.db";
let db: Promise<SQLiteDatabase> | null;

const openDatabase = async (name: string) => {
  return new Promise<SQLiteDatabase>((resolve, reject) => {
    db = openDatabaseAsync(name);

    db.then((db) => {
      resolve(db);
    }).catch((error) => {
      console.log("Error opening database", error);
      reject(error);
    });

  });
}


// Function to get the current database version
const getDatabaseVersion = async (db: SQLiteDatabase) => {
  // Get the latest version number from the version table
  try {
    const result: any = await db.getFirstAsync(`
      SELECT max(version) as version FROM version LIMIT 1
    `);
    const latestVersion = parseInt(result?.version);
    if (latestVersion === 0 || isNaN(latestVersion)) {
      return 0;
    }
    return latestVersion;
  } catch (error) {
    console.log("Error getting database version, setting to 0", error);
    // If there is an error, return 0
    return 0;
  }
}

// Function to set the database version
const setDatabaseVersion = async (db: SQLiteDatabase, version: number) => {
  try {
    await db.runAsync(`INSERT INTO version (version) values (?)`, version);
  } catch (error) {
    console.log("Error setting database version", error);
  }
}

const migrateDatabase = async (db: SQLiteDatabase) => {
  // Get the current database version
  const currentVersion = await getDatabaseVersion(db);
  // If the current version is 0, create the tables
  if (currentVersion === 0) {
    await db.execAsync("PRAGMA journal_mode = 'wal';");
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.execAsync("DROP TABLE IF EXISTS tasks;");
    await db.execAsync("DROP TABLE IF EXISTS todos;");
    await db.execAsync("DROP TABLE IF EXISTS version;");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        index_no INTEGER NOT NULL DEFAULT 0
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        duration INTEGER DEFAULT 15,
        content BLOB,
        attachment BLOB,
        todo_id INTEGER,
        index_no INTEGER DEFAULT 0,
        FOREIGN KEY(todo_id) REFERENCES todos(id)
      );
    `);

    // Insert some sample data
    await db.execAsync(`
      INSERT INTO todos (title, index_no) values ('Study Physics in the library', 1);
    `);
    await db.execAsync(`
      INSERT INTO todos (title, index_no) values ('Take a walk in the park', 2);
    `);

    // Create the version table for tracking the database version number
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS version (
        version INTEGER
      );
    `);
    // Set the database version to 1
    await setDatabaseVersion(db, currentVersion + 1);
  }
}

export const initializeDatabase = async () => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  await migrateDatabase(db);
}

export const getTodos = async (setTodos: (todos: Todo[]) => void) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const query = "SELECT * FROM todos order by index_no asc";
  const todos = await db.getAllAsync<Todo>(query);
  setTodos(todos);
}

export const addNewTodo = async (setTodos: (todos: Todo[]) => void, title: string) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("INSERT INTO todos (title) values ($title)");
  let result;
  try {
    result = await statement.executeAsync({ $title: title });
  } finally {
    await statement.finalizeAsync();
  }
  return result;
}

export const updateTodo = async (setTodos: (todos: Todo[]) => void, id: number, title: string) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("UPDATE todos set title = $title where id = $id");
  let result;
  try {
    result = await statement.executeAsync({ $title: title, $id: id });
  } finally {
    await statement.finalizeAsync();
  }
  return result;
}

export const deleteTodo = async (setTodos: (todos: Todo[]) => void, id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("DELETE FROM todos where id = $id");
  let result;
  try {
    result = await statement.executeAsync({ $id: id });
  } finally {
    await statement.finalizeAsync();
  }
  return result;
}

