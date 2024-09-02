import {
  SQLiteProvider,
  useSQLiteContext,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { Todo } from "../models/todo";
import { Task } from "../models/task";
import { getObjectType } from "../helpers/utils";
import * as FileSystem from "expo-file-system";

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

// Function to delete the database file
const deleteDatabaseFile = async () => {
  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite${todos_db}`;
    const fileExists = await FileSystem.getInfoAsync(dbPath);

    if (fileExists.exists) {
      await FileSystem.deleteAsync(dbPath);
      console.log(`Database file ${todos_db} deleted`);
    } else {
      console.log(`Database file ${todos_db} does not exist`);
    }
  } catch (error) {
    console.log("Error deleting database file", error);
  }
};

// Function to migrate the database
const migrateDatabase = async (db: SQLiteDatabase, version: number = -1) => {
  // Get the current database version
  var currentVersion = await getDatabaseVersion(db);
  console.log("Current database version: ", currentVersion);

  // If a version is provided, set the current version to the provided version
  // This is useful for resetting the database to a specific version or resetting the database
  if (version > -1) {
    currentVersion = version;
  }

  // If the current version is 0, create the tables, insert some sample data
  // and set the migration version to 1 to prevent reinstalling the tables.
  if (currentVersion === 0) {
    // Remove any sqlite database file
    deleteDatabaseFile();

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
    await db.execAsync("DROP TABLE IF EXISTS categories;").catch((error) => {
      console.log("Error dropping version table", error);
    });
    await db.execAsync("DROP TABLE IF EXISTS settings;").catch((error) => {
      console.log("Error dropping version table", error);
    });
    await db
      .execAsync("DROP TABLE IF EXISTS passive_assignments;")
      .catch((error) => {
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
        category_id INTEGER DEFAULT -1,
        has_completed INTEGER DEFAULT 0,
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
        scheduled_at TEXT DEFAULT "",
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

    // Create categories table
    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        color TEXT DEFAULT "",
        name TEXT DEFAULT "",
        is_fav INTEGER DEFAULT 0
      );
    `
      )
      .then(() => {
        console.log("Table categories created");
      })
      .catch((error) => {
        console.log("Error creating table categories", error);
      });

    // Create settings table
    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exports TEXT DEFAULT "",
        theme_color TEXT DEFAULT ""
        is_first_time INTEGER DEFAULT 1
        has_read_privacy INTEGER DEFAULT 0
        send_from_email TEXT DEFAULT ""
        send_from_name TEXT DEFAULT ""
      );
    `
      )
      .then(() => {
        console.log("Table settings created");
      })
      .catch((error) => {
        console.log("Error creating table settings", error);
      });

    // Create passive_assignments table
    await db
      .execAsync(
        `
      CREATE TABLE IF NOT EXISTS passive_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_ref TEXT DEFAULT "",
        request_token TEXT DEFAULT "",
        todo_id_ref INTEGER,
      );
    `
      )
      .then(() => {
        console.log("Table passive_assignments created");
      })
      .catch((error) => {
        console.log("Error creating table passive_assignments", error);
      });

    //Insert sample categories
    await db
      .execAsync(
        `INSERT INTO categories (color, name, is_fav) VALUES 
        ('#009f95', 'Personal', 1),
        ('#4682B4', 'Study', 1),
        ('#FF6347', 'Family', 1),
        ('#6e9f00', 'Shopping', 0),
        ('#9933ff', 'Work', 1),
        ('#808080', 'Others', 0);`
      )
      .then(() => {
        console.log("Sample categories inserted");
      })
      .catch((error) => {
        console.log("Error insert sample categories:", error);
      });

    // Insert some sample data
    await db
      .execAsync(
        `
      INSERT INTO todos (title, index_no, category_id) values ('Study Physics in the library', 1, (SELECT id FROM categories WHERE name = 'Study'));
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
      INSERT INTO tasks (name, duration, todo_id, index_no, scheduled_at, category_id) values ('Read Chapter 1 by Monday', 15, 1, 1, 'Jan 01, 2024, 01:01 PM');
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
      INSERT INTO tasks (name, duration, todo_id, index_no, scheduled_at) values ('Read Chapter 2 by Tuesday morning', 15, 1, 1, 'Jan 01, 2024, 01:01 PM');
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
      INSERT INTO tasks (name, duration, todo_id, index_no, scheduled_at) values ('Read Chapter 3 by this weekend.', 15, 1, 1, 'Jan 01, 2024, 01:01 PM');
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
      INSERT INTO todos (title, index_no, category_id, has_completed) values ('Take a walk in the park', 2, (SELECT id FROM categories WHERE name = 'Personal'), 1);
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
  }
};

export const resetDatabase = async () => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  await setDatabaseVersion(db, 0);
  await migrateDatabase(db, 0);
  await setDatabaseVersion(db, 0);
};

export const initializeDatabase = async () => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  await migrateDatabase(db);
};

// TODO OPERATIONS ////

export const getTodos = async (
  setTodos: Function,
  keyword: string = "",
  show_completed: boolean = true
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  // Additional query to filter by keyword
  let keyword_query = "";
  if (keyword.length > 0) {
    keyword_query = `WHERE (t.title LIKE '%${keyword}%' OR (c.name LIKE '%${keyword}%'))`;
  }

  // Additional query to filter by completed status
  console.log("show_completed: ", show_completed);
  let hide_completed_query = "";
  if (!show_completed) {
    hide_completed_query = "AND t.has_completed = 0";
  }

  console.log("11show_completed: ", show_completed, hide_completed_query);

  const query = `SELECT t.id, t.title, t.notes, t.attachment, t.geolocation, t.category_id, 
    t.index_no, c.name as 'category_name', c.color as 'category_color',
    t.has_completed,
    CASE WHEN t.notes IS "" THEN 0 ELSE 1 END as 'has_notes',
    (SELECT count(*) FROM images WHERE todo_id = t.id) as 'image_count',
    CASE WHEN t.geolocation IS "" THEN 0 ELSE 1 END as 'has_geolocation'
    FROM todos t JOIN categories c ON t.category_id == c.id 
    ${hide_completed_query}
    ${keyword_query} ORDER BY index_no asc;`;
  const todos = await db.getAllAsync<Todo>(query);
  console.log("query: ", query, "show_completed: ", show_completed);
  setTodos(todos);
};

export const addNewTodo = async (
  setTodos: Function,
  title: string,
  category_id: number
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "INSERT INTO todos (title, index_no, category_id) values ($title, (SELECT max(index_no) + 1 FROM todos), $category_id)"
  );
  let result;
  try {
    result = await statement.executeAsync({
      $title: title,
      $category_id: category_id,
    });
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

export const updateTodoCompleted = async (
  todo_id: number,
  has_completed: number
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "UPDATE todos set has_completed = $has_completed where id = $id"
  );
  let result;
  try {
    result = await statement.executeAsync({
      $has_completed: has_completed,
      $id: todo_id,
    });
  } finally {
    await statement.finalizeAsync();
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
    "SELECT t2.id, t2.name, t2.duration, t2.todo_id, t2.index_no, t2.scheduled_at FROM todos AS t1 JOIN tasks AS t2 ON t1.id == t2.todo_id WHERE t1.id == $todo_id ORDER by t2.index_no desc, t2.id asc";
  const tasks = await db.getAllAsync<Task>(query, { $todo_id: todo_id });
  setTasks(tasks);
};

export const addNewTask = async (
  setTasks: Function,
  todo_id: number,
  name: string,
  duration: number,
  scheduled_at: string
) => {
  console.log("scheduled_at: ", scheduled_at);
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "INSERT INTO tasks (name, duration, todo_id, scheduled_at) values ($name, $duration, $todo_id, $scheduled_at)"
  );
  try {
    result = await statement.executeAsync({
      $name: name,
      $duration: duration,
      $todo_id: todo_id,
      $scheduled_at: scheduled_at,
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

// CATEGORY OPERATIONS ////

export const getCategories = async (is_fav: boolean = false) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  let filter_query = "";
  console.log("is_fav: ", is_fav);
  if (is_fav) {
    filter_query = "WHERE is_fav = 1";
  }

  const query = `SELECT id, color, name, is_fav FROM categories ${filter_query} ORDER BY id ASC`;
  const categories = await db.getAllAsync<{
    color: string;
    name: string;
    is_fav: number;
  }>(query);
  return categories;
};

export const deleteCategory = async (category_id: number) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  // Set the category_id to null for all todos with the category_id
  const update_catid_statement = await db.prepareAsync(
    "UPDATE todos set category_id = null where category_id = $id"
  );
  let update_result;
  try {
    update_result = await update_catid_statement.executeAsync({
      $id: category_id,
    });
  } finally {
    await update_catid_statement.finalizeAsync();
    console.log(
      "Category id updated to null for todos with category id: ",
      category_id
    );
  }

  const statement = await db.prepareAsync(
    "DELETE FROM categories where id = $id"
  );
  let result;
  try {
    result = await statement.executeAsync({ $id: category_id });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};

export const addCategory = async (
  color: string,
  name: string,
  is_fav: number = 0
) => {
  const db: SQLiteDatabase = await openDatabase(todos_db);
  const statement = await db.prepareAsync(
    "INSERT INTO categories (color, name, is_fav) values ($color, $name, $is_fav)"
  );
  let result;
  try {
    result = await statement.executeAsync({
      $color: color,
      $name: name,
      $is_fav: is_fav,
    });
  } finally {
    await statement.finalizeAsync();
    return result;
  }
};
