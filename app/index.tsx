/*
  TODO:
  - Ensures that the app is working on both iOS and Android devices
  - Run with flushed database
  - Run depcheck for unused dependencies
  - Remove unused imports
  - Remove unused code
  - Publish expo app using ens for demo
  - Add comments to the code
  - Update README.md
*/

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
import { useIsFocused } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { name as appName } from "./app.json";
import { TodoSearchBar } from "./components/TodoSearchBar";
import { useRouter } from "expo-router";

/*
  Image Reference and Credits:
  splash.png - <a href="https://www.flaticon.com/free-icons/tomato" title="tomato icons">Tomato icons created by Flat Icons Design - Flaticon</a>
*/

// LogBox.ignoreAllLogs();

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
  const [addTaskButtonState, setAddTaskButtonState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const refreshTodos = async () => {
    console.log("Refreshing todos");
    await getTodos(setTodos, searchQuery);
  };

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      refreshTodos();
    };
    initDB();

    if (searchQuery.length > 0) {
      refreshTodos();
    }
  }, [searchQuery]);

  useFocusEffect(() => {
    refreshTodos();
  });

  const gotoSettingsScreen = () => {
    router.push("/settings");
  }
  
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
        gotoSettingsScreen={gotoSettingsScreen}
      />
      <TodoSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
    marginTop: -10,
  },
  tasksContainer: {
    flex: 10,
    padding: 20,
  },
  naviButton: {
    color: "red",
    marginRight: 10,
  },
  serachContainer: {
    padding: 20,
    flexDirection: "row",
  },
});
