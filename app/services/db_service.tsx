import {
  SQLiteProvider,
  useSQLiteContext,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { Todo } from "../models/todo";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
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
    await db.runAsync(
      "INSERT INTO todos (title, index_no) values (?, ?)",
      "Study Physics in the library",
      1
    );
    
    await db.runAsync(
      "INSERT INTO todos (title, index_no) values (?, ?)",
      "Take a walk in the park",
      2
    );
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function getAllTodos(db: SQLiteDatabase) {
  const query = "SELECT * FROM todos order by index_no asc";
  return await db.getAllAsync<Todo>(query);
}

export async function addNewTodo(db: SQLiteDatabase, title: string) {
  const statement = await db.prepareAsync("INSERT INTO todos (title) values ($title)");
  let result;
  try {
    result = await statement.executeAsync({$title: title});
  } finally {
    await statement.finalizeAsync();
  }
  return result;
}

export async function getAllTasks(db: SQLiteDatabase, todo_id: number) {
  if (db === null) {
    db = await openDatabaseAsync("todos.db");
  }
  return await db.getAllAsync<Task>(
    "select t2.id, t2.name, t2.duration, t2.content, t2.attachment, t2.todo_id, t2.index_no from todos as t1 join tasks as t2 on t1.id == t2.todo_id where t1.id == "+todo_id+" order by t2.index_no asc;"
  );
}




export async function addNewTask(db: SQLiteDatabase, todo_id: number, name: string, duration: number) {
  if (db === null) {
    db = await openDatabaseAsync("todos.db");
  }

  await db.runAsync(
    "INSERT INTO tasks (name, duration, todo_id) values (?, ?, ?)",
    name,
    parseInt(duration),
    todo_id
  );
}
  
export async function clearAllTasks(db: SQLiteDatabase) {
  if (db === null) {
    db = await openDatabaseAsync("todos.db");
  }
  await db.runAsync("DELETE FROM tasks");
  
}
