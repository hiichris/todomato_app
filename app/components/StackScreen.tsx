import { Stack, Link } from "expo-router";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Modal,
  View,
  Alert,
  Button,
} from "react-native";

import AddTodoModal from "./AddTodoModal";
import { primaryColor } from "../helpers/constants";
import AddTaskModal from "./AddTaskModal";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/FontAwesome";

const todoButton = (setTodoModalVisible, setImportant, setUrgent) => {
  return (
    <Pressable
      onPress={() => {
        // Check importance
        Alert.alert("🧐 Important?", "Is this event important?", [
          {
            text: "No",
            onPress: () => {
              setImportant(false);
              console.log("No pressed");
              Alert.alert("🔥 Urgent?", "Is this event urgent?", [
                {
                  text: "No",
                  onPress: () => {
                    setUrgent(false);
                    console.log("No pressed");

                    Alert.alert(
                      "Unfortunately...",
                      "Events that are not important and not urgent can wait. Todo creation is skipped for now. A future feature will allow you to create this event in a different category. Stay tuned.🥹"
                    );
                  },
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () => {
                    setUrgent(true);
                    console.log("Yes pressed");

                    console.log("Set modal visible");
                    setTodoModalVisible(true);
                  },
                },
              ]);
            },
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              setImportant(true);
              console.log("Yes pressed");
              // Check urgency
              Alert.alert("🔥 Urgent?", "Is this event urgent?", [
                {
                  text: "No",
                  onPress: () => {
                    setUrgent(false);
                    console.log("No pressed");

                    console.log("Set modal visible");
                    setTodoModalVisible(true);
                  },
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () => {
                    setUrgent(true);
                    console.log("Yes pressed");

                    console.log("Set modal visible");
                    setTodoModalVisible(true);
                  },
                },
              ]);
            },
          },
        ]);
      }}
    >
      <Text style={styles.naviButton}>Add Todo</Text>
    </Pressable>
  );
};

const taskButton = (setTaskModalVisible) => {
  return (
    <Pressable
      onPress={() => {
        console.log("Set modal visible");
        setTaskModalVisible(true);
      }}
    >
      <Text style={styles.naviButton}>Add Task</Text>
    </Pressable>
  );
};

const settingsButton = ({ gotoSettingsScreen }) => {
  return (
    <Pressable
      onPress={() => {
        gotoSettingsScreen();
      }}
    >
      <Icon
        name="cog"
        style={[styles.naviButton, { paddingHorizontal: 4 }]}
        size={24}
      />
    </Pressable>
  );
};

export default function StackScreen({
  title,
  todoId,
  setTodos,
  refreshTodos,
  refreshTasks,
  addTodoButtonState,
  setAddTodoButtonState,
  addTaskButtonState,
  setAddTaskButtonState,
  gotoSettingsScreen,
  categories,
  setCategories,
  scheduleNotification = null,
}) {
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);

  let headerRightComponent = () => {
    if (addTodoButtonState) {
      return todoButton(setTodoModalVisible, setImportant, setUrgent);
    }
    if (addTaskButtonState) {
      return taskButton(setTaskModalVisible);
    }
  };

  let headerLeftComponent = () => {
    if (addTodoButtonState && !addTaskButtonState) {
      return settingsButton({ gotoSettingsScreen });
    }
    return;
  };

  return (
    <View style={styles.stackContainer}>
      <Stack.Screen
        options={{
          title: title,
          headerLeft: headerLeftComponent,
          headerRight: headerRightComponent,
        }}
      ></Stack.Screen>
      <AddTodoModal
        setTodos={setTodos}
        refreshTodos={refreshTodos}
        modalVisible={todoModalVisible}
        setModalVisible={setTodoModalVisible}
        categories={categories}
        setCategories={setCategories}
      />
      <AddTaskModal
        todoId={todoId}
        setTodos={setTodos}
        refreshTodos={refreshTodos}
        refreshTasks={refreshTasks}
        modalVisible={taskModalVisible}
        setModalVisible={setTaskModalVisible}
        scheduleNotification={scheduleNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  naviButton: {
    color: primaryColor,
    paddingVertical: 6,
  },
  stackContainer: {
    height: 0,
  },
});
