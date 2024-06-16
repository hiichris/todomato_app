import { SQLiteProvider } from "expo-sqlite";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Modal,
  Pressable,
} from "react-native";

import { migrateDbIfNeeded, clearAllTasks } from "./services/db_service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";
import { Todo } from "./models/todo";
import { useSQLiteContext } from "expo-sqlite";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <View style={styles.container}>
      <SQLiteProvider databaseName="todos.db" onInit={migrateDbIfNeeded}>
      <StackScreen title="Todomato" todos={todos} setTodos={setTodos} addTodoButton={true} />
        <View style={styles.tasksContainer}>
          <TodoItems todos={todos} setTodos={setTodos} />
        </View>
      </SQLiteProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tasksContainer: {
    flex: 10,
    padding: 20,
  },
  naviButton: {
    color: "red",
    marginRight: 10,
  },
});
