import {
  SQLiteProvider,
  useSQLiteContext,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { Todo } from "../models/todo";

const todos_db = "todos.db";
let db: Promise<SQLiteDatabase> | null;

// Internal function to open the database and return the promise
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
  // await db.execAsync("DROP TABLE IF EXISTS version;")
  
  // Get the current database version
  const currentVersion = await getDatabaseVersion(db);
  
  // If the current version is 0, create the tables, insert some sample data
  // and set the migration version to 1 to prevent reinstalling the tables.
  if (currentVersion === 0) {
    // Prepare the database for the first time
    await db.execAsync("PRAGMA journal_mode = 'wal';")
      .catch((error) => { console.log("Error setting journal mode", error); });
    await db.execAsync("PRAGMA foreign_keys = ON;")
      .catch((error) => { console.log("Error setting foreign keys", error); });
    await db.execAsync("DROP TABLE IF EXISTS tasks;")
      .catch((error) => { console.log("Error dropping tasks table", error); });
    await db.execAsync("DROP TABLE IF EXISTS todos;")
      .catch((error) => { console.log("Error dropping todos table", error); });
    await db.execAsync("DROP TABLE IF EXISTS version;")
      .catch((error) => { console.log("Error dropping version table", error); });

    // Create the todos and tasks tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        index_no INTEGER NOT NULL DEFAULT 0
      );
    `).then(() => {
      console.log("Table todos created");
    }).catch((error) => {
      console.log("Error creating table todos", error);
    });

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
    `).then(() => {
      console.log("Table tasks created");
    }).catch((error) => {
      console.log("Error creating table tasks", error);
    });;

    // Insert some sample data
    await db.execAsync(`
      INSERT INTO todos (title, index_no) values ('Study Physics in the library', 1);
    `).then(() => {
      console.log("Sample #1 inserted");
    }).catch((error) => {
      console.log("Error insert sample #1:", error);
    });
    await db.execAsync(`
      INSERT INTO todos (title, index_no) values ('Take a walk in the park', 2);
    `).then(() => {
      console.log("Sample #2 inserted");
    }).catch((error) => {
      console.log("Error insert sample #2:", error);
    });

    // Create the version table for tracking the migration version number
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS version (
        version INTEGER
      );
    `).then(() => {
      console.log("Table version created");
    }).catch((error) => {
      console.log("Error creating table version", error);
    });

    // Set the database version to 1
    await setDatabaseVersion(db, currentVersion + 1).then(() => {
      console.log("Set database version to " + (currentVersion + 1));
    }).catch((error) => {
      console.log("Error creating table todos", error);
    });
  }
}


export const initializeDatabase = async () => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  await migrateDatabase(db);
}


export const getTodos = async (setTodos: Function) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const query = "SELECT * FROM todos order by index_no asc";
  const todos = await db.getAllAsync<Todo>(query);
  setTodos(todos);
}


export const addNewTodo = async (setTodos: Function, title: string) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("INSERT INTO todos (title) values ($title)");
  let result;
  try {
    result = await statement.executeAsync({ $title: title });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
}


export const updateTodo = async (setTodos: Function, id: number, title: string) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("UPDATE todos set title = $title where id = $id");
  let result;
  try {
    result = await statement.executeAsync({ $title: title, $id: id });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
}


export const deleteTodo = async (setTodos: Function, id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("DELETE FROM todos where id = $id");
  let result;
  try {
    result = await statement.executeAsync({ $id: id });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
}


export const getAllTasks = async (setTasks: Function, todo_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(`SELECT t2.id, t2.name, t2.duration, t2.content, t2.attachment, t2.todo_id, t2.index_no FROM todos AS t1 JOIN tasks AS t2 ON t1.id == t2.todo_id 
  WHERE t1.id == $todo_id ORDER by t2.index_no asc`);
  const tasks = await statement.executeAsync({ $todo_id: todo_id });
  setTasks(tasks);
}


export const addNewTask = async (setTasks: Function, todo_id: number, name: string, duration: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("INSERT INTO tasks (name, duration, todo_id) values ($name, $duration, $todo_id)");
  let result;
  try {
    result = await statement.executeAsync({ $name: name, $duration: duration, $todo_id: todo_id });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
}
