import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from "expo-sqlite";
import { Task } from "../models/task";

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
DROP TABLE IF EXISTS tasks; 
DROP TABLE IF EXISTS todos;
-- Create the todos table
CREATE TABLE "todos" (
	"id"	INTEGER NOT NULL,
	"title"	TEXT,
	"index_no"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id")
);
-- Create the tasks table
CREATE TABLE "tasks" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"duration"	INTEGER DEFAULT 15,
	"content"	BLOB,
	"attachment"	BLOB,
	"todo_id"	INTEGER,
	"index_no"	INTEGER DEFAULT 0,
	FOREIGN KEY("todo_id") REFERENCES "todos"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
`);
    await db.runAsync("INSERT INTO todos (title, index_no) values (?, ?)", "helloooooo o o ooooo oooo oooo ", 1);
    await db.runAsync("INSERT INTO todos (title, index_no) values (?, ?)", "world", 2);
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function getAllTodos(db: SQLiteDatabase) {
  const query = "SELECT * FROM todos";
  return await db.getAllAsync<Task>(query);
}

export async function addNewTodo(db: SQLiteDatabase, title: string) {
  return db.runAsync("INSERT INTO todos (title) values (?)", title);
}