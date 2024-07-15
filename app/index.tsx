import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Modal,
  Pressable,
} from "react-native";

import { initializeDatabase, getTodos } from "./services/db_service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";
import { Todo } from "./models/todo";
import { useIsFocused } from '@react-navigation/native';

function useFocusEffect(callback: () => void) {
  // Ref: https://reactnavigation.org/docs/use-is-focused/
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      callback();
    }
  }, [isFocused]);
}

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      refreshTodos();
    };
    initDB();
  }, []);

  useFocusEffect(() => {
    refreshTodos();
  });

  const refreshTodos = async () => {
    console.log("Refreshing todos");
    await getTodos(setTodos);
  }

  return (
    <>
      <StackScreen
        title="Home"
        todos={todos}
        setTodos={setTodos}
        refreshTodos={refreshTodos}
        addTodoButton={true}
      />

      <View style={styles.container}>

        <TodoItems todos={todos} refreshTodos={refreshTodos} />
      </View>
    </>
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
