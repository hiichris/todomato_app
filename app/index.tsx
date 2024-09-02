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

import { initializeDatabase, getTodos, getCategories } from "./services/db_service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";
import { Todo } from "./models/todo";
import { useIsFocused } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { name as appName } from "./app.json";
import { TodoSearchBar } from "./components/TodoSearchBar";
import { useRouter } from "expo-router";
import { FavCategories } from "./components/FavCategories";

/*
  Image Reference and Credits:
  splash.png - <a href="https://www.flaticon.com/free-icons/tomato" title="tomato icons">Tomato icons created by Flat Icons Design - Flaticon</a>
*/

// Ignore all logs for demoing purposes
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
  const [addTaskButtonState, setAddTaskButtonState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  
  const toggleSwitch = async () => {
    console.log("Toggling switch", isEnabled);
    setIsEnabled((previousState) => !previousState)
    refreshTodos(!isEnabled);
  };

  const refreshTodos = async (show_completed) => {
    console.log("Refreshing todos");
    await getTodos(setTodos, searchQuery, show_completed);
  };

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      refreshTodos(show_completed=isEnabled);
    };
    initDB();

    if (searchQuery.length > 0) {
      refreshTodos(show_completed=isEnabled);
    }
  }, [searchQuery]);

  useFocusEffect(() => {
    refreshTodos(show_completed=isEnabled);
  });

  const gotoSettingsScreen = () => {
    router.push("/settings");
  };

  const retrieveDBCategories = async () => {
    const dbCategories = await getCategories(false);
    setCategories(dbCategories);
  };

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
        categories={categories}
        setCategories={setCategories}
      />

      <TodoSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <FavCategories setSearchQuery={setSearchQuery} />

      <View style={styles.todoItemsContainer}>
        <TodoItems todos={todos} refreshTodos={refreshTodos} toggleSwitch={toggleSwitch} isEnabled={isEnabled} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  todoItemsContainer: {
    flex: 6,
    marginTop: 10,
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
