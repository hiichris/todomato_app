import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { ToDoItem } from "./models/todoitems";
import {
  createTable,
  getDBConnection,
  showTables,
  getTodoItems,
  saveTodoItems,
  getSQLiteConnection,
} from "./services/db-service";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const loadDataCallback = useCallback(async () => {
    // load data here
    try {
      const initTodos = [
        { id: 0, value: "go to shop" },
        { id: 1, value: "eat at least a one healthy foods" },
        { id: 2, value: "Do some exercises" },
      ];
      const db = await getSQLiteConnection();

      // create a table
      await createTable(db);


      // await createTable(db);
      // await showTables(db);
      // const db = await getDBConnection();
      // const storedTodoItems = await getTodoItems(db);
      // console.error("storedTodoItems"+ storedTodoItems);
      // // log to the terminal
      // console.log("storedTodoItems", storedTodoItems);
      // if (storedTodoItems.length) {
      //   setTodos(storedTodoItems);
      // } else {
      //   await saveTodoItems(db, initTodos);
      //   setTodos(initTodos);
      // }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <View>
            {todos.map((todo) => (
              <Text>{todo}</Text>
            ))}
            <Text>1</Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
