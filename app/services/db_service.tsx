import {
  SQLiteProvider,
  useSQLiteContext,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { Todo } from "../models/todo";
import { Task } from "../models/task";
import { getObjectType } from "../helpers/utils";

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
};

// MIGRATION OPERATIONS ////

// Function to get the current database version
const getDatabaseVersion = async (db: SQLiteDatabase) => {
  // Check if the version table exists
  try {
    const result: any = await db.getFirstAsync(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='version'
    `);
    if (result) {
      // If the table exists, continue to get the version number
    }
  } catch (_) {
    console.log("Error getting database version, setting to 0");
    return 0;
  }

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
  } catch (_) {
    console.log("Error getting database version, setting to 0");
    // If there is an error, return 0
    return 0;
  }
};

// Function to set the database version
const setDatabaseVersion = async (db: SQLiteDatabase, version: number) => {
  try {
    await db.runAsync(`INSERT INTO version (version) values (?)`, version);
  } catch (error) {
    console.log("Error setting database version", error);
  }
};

// Function to migrate the database
const migrateDatabase = async (db: SQLiteDatabase) => {
  // Get the current database version
  let currentVersion = await getDatabaseVersion(db);
  console.log("Current database version: ", currentVersion);

  // If the current version is 0, create the tables, insert some sample data
  // and set the migration version to 1 to prevent reinstalling the tables.
  if (currentVersion === 0) {
    // Prepare the database for the first time
    await db.execAsync("PRAGMA journal_mode = 'wal';").catch((error) => {
      console.log("Error setting journal mode", error);
    });
    await db.execAsync("PRAGMA foreign_keys = ON;").catch((error) => {
      console.log("Error setting foreign keys", error);
    });
    await db.execAsync("DROP TABLE IF EXISTS tasks;").catch((error) => {
      console.log("Error dropping tasks table", error);
    });
    await db.execAsync("DROP TABLE IF EXISTS todos;").catch((error) => {
      console.log("Error dropping todos table", error);
    });
    await db.execAsync("DROP TABLE IF EXISTS version;").catch((error) => {
      console.log("Error dropping version table", error);
    });
    await db.execAsync("DROP TABLE IF EXISTS images;").catch((error) => {
      console.log("Error dropping version table", error);
    });

    // Create the todos and tasks tables
    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        notes TEXT DEFAULT "",
        attachment TEXT DEFAULT "",
        geolocation TEXT DEFAULT "",
        index_no INTEGER NOT NULL DEFAULT 0
      );
    `
      )
      .then(() => {
        console.log("Table todos created");
      })
      .catch((error) => {
        console.log("Error creating table todos", error);
      });

    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        scheduled_at DATETIME DEFAULT NULL,
        duration INTEGER DEFAULT 15,
        todo_id INTEGER,
        index_no INTEGER DEFAULT 0,
        FOREIGN KEY(todo_id) REFERENCES todos(id)
      );
    `
      )
      .then(() => {
        console.log("Table tasks created");
      })
      .catch((error) => {
        console.log("Error creating table tasks", error);
      });

    // Create images table
    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo_id INTEGER,
        image_url TEXT NOT NULL,
        FOREIGN KEY(todo_id) REFERENCES todos(id)
      );
    `
      )
      .then(() => {
        console.log("Table images created");
      })
      .catch((error) => {
        console.log("Error creating table images", error);
      });

    // Insert some sample data
    await db
      .execAsync(
        `
      INSERT INTO todos (title, index_no) values ('Study Physics in the library', 1);
    `
      )
      .then(() => {
        console.log("Sample #1 inserted");
      })
      .catch((error) => {
        console.log("Error insert sample #1:", error);
      });
    await db
      .execAsync(
        `
      INSERT INTO tasks (name, duration, todo_id, index_no) values ('Read Chapter 1 by Monday', 15, 1, 1);
        `
      )
      .then(() => {
        console.log("Task #1 inserted");
      })
      .catch((error) => {
        console.log("Error insert sample #1:", error);
      });
    await db
      .execAsync(
        `
      INSERT INTO tasks (name, duration, todo_id, index_no) values ('Read Chapter 2 by Tuesday morning', 15, 1, 1);
        `
      )
      .then(() => {
        console.log("Task #1 inserted");
      })
      .catch((error) => {
        console.log("Error insert sample #1:", error);
      });
    await db
      .execAsync(
        `
      INSERT INTO tasks (name, duration, todo_id, index_no) values ('Read Chapter 3 by this weekend.', 15, 1, 1);
        `
      )
      .then(() => {
        console.log("Task #1 inserted");
      })
      .catch((error) => {
        console.log("Error insert sample #1:", error);
      });

    await db
      .execAsync(
        `
      INSERT INTO todos (title, index_no) values ('Take a walk in the park', 2);
    `
      )
      .then(() => {
        console.log("Sample #2 inserted");
      })
      .catch((error) => {
        console.log("Error insert sample #2:", error);
      });

    // Create the version table for tracking the migration version number
    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS version (
        version INTEGER
      );
    `
      )
      .then(() => {
        console.log("Table version created");
      })
      .catch((error) => {
        console.log("Error creating table version", error);
      });

    // Set the database version to 1
    await setDatabaseVersion(db, currentVersion + 1)
      .then(() => {
        console.log("Set database version to " + (currentVersion + 1));
      })
      .catch((error) => {
        console.log("Error creating table todos", error);
      });
    currentVersion = 1;
  }
};

export const initializeDatabase = async () => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  await migrateDatabase(db);
};

// TODO OPERATIONS ////

export const getTodos = async (setTodos: Function, keyword = "") => {
  const db: SQLiteDatabase = await openDatabase(todos_db);

  if (keyword.length > 0) {
    const query =
      "SELECT * FROM todos WHERE title LIKE $keyword order by index_no asc";
    const todos = await db.getAllAsync<Todo>(query, {
      $keyword: `%${keyword}%`,
    });
    setTodos(todos);
  } else {
    const query = "SELECT * FROM todos order by index_no asc";
    const todos = await db.getAllAsync<Todo>(query);
    setTodos(todos);
  }
};

export const addNewTodo = async (setTodos: Function, title: string) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "INSERT INTO todos (title, index_no) values ($title, (SELECT max(index_no) + 1 FROM todos))"
  );
  let result;
  try {
    result = await statement.executeAsync({ $title: title });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};

export const updateTodoNotes = async (
  setTodoNotes: Function,
  id: number,
  notes: string
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "UPDATE todos set notes = $notes where id = $id"
  );
  let result;
  console.log("notes: ", notes, "id: ", id);
  try {
    result = await statement.executeAsync({ $notes: notes, $id: id });
  } finally {
    await statement.finalizeAsync();
    setTodoNotes(notes);
    return result;
  }
};

//Function to delete a todo
export const deleteTodo = async (todo_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);

  // Delete all related images
  const delete_images_statement = await db.prepareAsync(
    "DELETE FROM images where todo_id = $todo_id"
  );
  let result;
  try {
    result = await delete_images_statement.executeAsync({ $todo_id: todo_id });
  } finally {
    await delete_images_statement.finalizeAsync();
  }

  // Delete all related tasks
  const delete_tasks_statement = await db.prepareAsync(
    "DELETE FROM tasks where todo_id = $todo_id"
  );
  try {
    result = await delete_tasks_statement.executeAsync({ $todo_id: todo_id });
  } finally {
    await delete_tasks_statement.finalizeAsync();
  }

  // Finally, delete the todo record
  const delete_todo_statement = await db.prepareAsync(
    "DELETE FROM todos where id = $todo_id"
  );
  try {
    result = await delete_todo_statement.executeAsync({ $todo_id: todo_id });
  } finally {
    await delete_todo_statement.finalizeAsync();
    return result;
  }
};

// TASK OPERATIONS ////

export const getAllTasks = async (setTasks: Function, todo_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const query =
    "SELECT t2.id, t2.name, t2.duration, t2.todo_id, t2.index_no FROM todos AS t1 JOIN tasks AS t2 ON t1.id == t2.todo_id WHERE t1.id == $todo_id ORDER by t2.index_no desc, t2.id asc";
  const tasks = await db.getAllAsync<Task>(query, { $todo_id: todo_id });
  setTasks(tasks);
};

export const addNewTask = async (
  setTasks: Function,
  todo_id: number,
  name: string,
  duration: number
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "INSERT INTO tasks (name, duration, todo_id) values ($name, $duration, $todo_id)"
  );
  try {
    result = await statement.executeAsync({
      $name: name,
      $duration: duration,
      $todo_id: todo_id,
    });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};

export const getTaskCount = async (todo_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const query = "SELECT count(*) as count FROM tasks WHERE todo_id = $todo_id";
  const result = await db.getFirstAsync<{ count: number }>(query, {
    $todo_id: todo_id,
  });
  return result?.count || 0;
};

export const deleteTask = async (setTasks: Function, task_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync("DELETE FROM tasks where id = $id");
  let result;
  try {
    result = await statement.executeAsync({ $id: task_id });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};

// IMAGE OPERATIONS ////

export const getImages = async (todo_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const query = "SELECT image_url FROM images WHERE todo_id = $todo_id";
  const images = await db.getAllAsync<[string]>(query, { $todo_id: todo_id });
  return images;
};

export const addImage = async (todo_id: number, image_url: string) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "INSERT INTO images (todo_id, image_url) values ($todo_id, $image_url)"
  );
  let result;
  try {
    result = await statement.executeAsync({
      $todo_id: todo_id,
      $image_url: image_url,
    });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};

// GEOTAG OPERATIONS ////

export const getGeolocation = async (todo_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const query = "SELECT geolocation FROM todos WHERE id = $todo_id";
  const geolocation = await db.getFirstAsync<{ geolocation: string }>(query, {
    $todo_id: todo_id,
  });
  return geolocation;
};

export const updateGeolocation = async (
  todo_id: number,
  geolocation: string
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "UPDATE todos set geolocation = $geolocation where id = $id"
  );
  let result;
  try {
    result = await statement.executeAsync({
      $geolocation: geolocation,
      $id: todo_id,
    });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};
