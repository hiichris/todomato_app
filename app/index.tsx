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

import { migrateDbIfNeeded } from "./services/db_service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";
import { Todo } from "../models/todo";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <View style={styles.container}>
      <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
        <View style={styles.tasksContainer}>
          <TodoItems todos={todos} setTodos={setTodos} />
        </View>
      <StackScreen title="Todomato" todos={todos} setTodos={setTodos} />
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
