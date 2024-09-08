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
import { View, StyleSheet } from "react-native";
import { initializeDatabase, getTodos } from "./services/db_service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";
import { Todo } from "./models/todo";
import { useIsFocused } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TodoSearchBar } from "./components/TodoSearchBar";
import { useRouter } from "expo-router";
import { FavCategories } from "./components/FavCategories";
import * as ScreenOrientation from "expo-screen-orientation";

/*
  Image Reference and Credits:
  splash.png - <a href="https://www.flaticon.com/free-icons/tomato" title="tomato icons">Tomato icons created by Flat Icons Design - Flaticon</a>
*/

// Ignore all logs for demoing purposes
// LogBox.ignoreAllLogs();

function useFocusEffect(callback: () => void) {
  // Ref: (https://reactnavigation.org/docs/use-is-focused/)
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      callback();
    }
  }, [isFocused]);
}

// Home Screen Component
export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [addTodoButtonState, setAddTodoButtonState] = useState(true);
  const [addTaskButtonState, setAddTaskButtonState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPassiveAssignment, setIsPassiveAssignment] = useState(false);

  // Toggle switch to show completed tasks
  const toggleSwitch = async () => {
    console.log("Toggling switch", isEnabled);
    setIsEnabled((previousState) => !previousState);
    refreshTodos(!isEnabled);
  };

  // Refresh todos
  const refreshTodos = async (show_completed) => {
    console.log("Refreshing todos");
    await getTodos(setTodos, searchQuery, show_completed);
  };

  useEffect(() => {
    // Initialize database and lock orientation
    const initDB = async () => {
      await initializeDatabase();
      refreshTodos(isEnabled);
    };

    const lockOrientation = async () => {
      // Lock orientation to portrait
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      )
        .then((result) => {
          console.log("Orientation locked to portrait");
        })
        .catch((error) => {
          console.log("Error locking orientation to portrait", error);
        });

      console.log("Orientation locked to portrait");
    };

    // Run the functions
    initDB();
    lockOrientation();

    // If search query is present, refresh todos
    if (searchQuery.length > 0) {
      refreshTodos(isEnabled);
    }
  }, [searchQuery]);

  // Refresh the screen when focused; this is useful when the user navigates
  // back to the screen and needs to see the updated todos
  useFocusEffect(() => {
    refreshTodos(isEnabled);
  });

  // Navigate to settings screen
  const gotoSettingsScreen = () => {
    router.push("/settings");
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
        setIsPassiveAssignment={setIsPassiveAssignment}
        isPassiveAssignment={isPassiveAssignment}
        router={router}
      />

      <TodoSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <FavCategories setSearchQuery={setSearchQuery} />

      <View style={styles.todoItemsContainer}>
        <TodoItems
          todos={todos}
          refreshTodos={refreshTodos}
          toggleSwitch={toggleSwitch}
          isEnabled={isEnabled}
        />
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
