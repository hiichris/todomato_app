import { ToDoItem } from "../models/todoitems";

import * as SQLite from "expo-sqlite";

const tableName = "todoData";

export const executeSql = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => resolve(rows),
        (t, error) => reject(error)
      );
    });
  });

export const getSQLiteConnection = async () => {
  return SQLite.openDatabase("todoData.db");
};

export const createTable = async (db: SQLite.SQLiteDatabase) => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        value TEXT NOT NULL
    );`;

  await db.transation(async (tx) => {
    await tx.executeSql(query);
  });
};

export const showTables = async (db) => {
  const query = `SELECT name FROM sqlite_master WHERE type='table'`;
  await db.transaction(async (tx) => {
    const result = await tx.executeSql(query);
    console.log("show table:" + result);
  });
};

// export const getTodoItems = async (db: SQLite.SQLiteDatabase): Promise<ToDoItem[]> => {
//   try {
//     const todoItems: ToDoItem[] = [];
//     const results = await db.executeSql(`SELECT rowid as id,value FROM ${tableName}`);
//     results.forEach(result => {
//       for (let index = 0; index < result.rows.length; index++) {
//         todoItems.push(result.rows.item(index))
//       }
//     });
//     return todoItems;
//   } catch (error) {
//     console.error(error);
//     throw Error('Failed to get todoItems !!!');
//   }
// };

// export const saveTodoItems = async (db: SQLite.SQLiteDatabase, todoItems: ToDoItem[]) => {
//   const insertQuery =
//     `INSERT OR REPLACE INTO ${tableName}(rowid, value) values` +
//     todoItems.map(i => `(${i.id}, '${i.value}')`).join(',');

//   return db.executeSql(insertQuery);
// };

// export const deleteTodoItem = async (db: SQLite.SQLiteDatabase, id: number) => {
//   const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`;
//   await db.executeSql(deleteQuery);
// };

// export const deleteTable = async (db: SQLite.SQLiteDatabase) => {
//   const query = `drop table ${tableName}`;

//   await db.executeSql(query);
// };
