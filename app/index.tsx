import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Modal,
  Pressable,
  AppRegistry,
  LogBox,
} from "react-native";

import { initializeDatabase, getTodos } from "./services/db_service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";
import { Todo } from "./models/todo";
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { name as appName } from './app.json';

/*
  Image Reference and Credits:
  splash.png - <a href="https://www.flaticon.com/free-icons/tomato" title="tomato icons">Tomato icons created by Flat Icons Design - Flaticon</a>


*/


LogBox.ignoreAllLogs();

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
  const [addTodoButtonState, setAddTodoButtonState] = useState(true);
  const [addTaskButtonState, setAddTaskButtonState] = useState(true);

  const refreshTodos = async () => {
    console.log("Refreshing todos");
    await getTodos(setTodos);
  }

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StackScreen
        title="🍅"
        setTodos={setTodos}
        refreshTodos={refreshTodos}
        addTodoButtonState={addTodoButtonState}
        setAddTodoButtonState={setAddTodoButtonState}
        addTaskButtonState={addTaskButtonState}
        setAddTaskButtonState={setAddTaskButtonState}
      />

      <View style={styles.container}>

        <TodoItems todos={todos} refreshTodos={refreshTodos} />
      </View>
      </GestureHandlerRootView>
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
