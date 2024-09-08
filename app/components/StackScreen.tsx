import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, StyleSheet, Pressable, View, Alert } from "react-native";

import AddTodoModal from "./AddTodoModal";
import { primaryColor } from "../helpers/constants";
import AddTaskModal from "./AddTaskModal";
import Icon from "react-native-vector-icons/FontAwesome";
import AddPassiveAssignmentModal from "./AddPassiveAssignmentModal";

// Todo Button Component
const todoButton = (
  setTodoModalVisible,
  setPassiveAssignmentModalVisible,
  setImportant,
  setUrgent
) => {
  // Ask the user if the todo is important and urgent by incorporating the Eisenhower Matrix
  // for better time management. https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method
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

                    console.log("Set passive assignment modal visible");
                    setPassiveAssignmentModalVisible(true);
                  },
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () => {
                    setUrgent(true);
                    console.log("Yes pressed");

                    console.log("Set add todo modal visible");
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

// Task Button Component
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

// Settings Button Component
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

// Custom Stack Screen Component
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
  router,
  expandPassiveAssignmentModal = null,
  scheduleNotification = null,
}) {
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [passiveAssignmentModalVisible, setPassiveAssignmentModalVisible] =
    useState(false);
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    console.log(
      "(urgent",
      urgent,
      "important",
      important,
      "expand",
      expandPassiveAssignmentModal,
      ")"
    );
    // If expandPassiveAssignmentModal is true, show the modal
    if (expandPassiveAssignmentModal) {
      setPassiveAssignmentModalVisible(true);
    }
  }, [expandPassiveAssignmentModal]);

  // Header right component
  let headerRightComponent = () => {
    if (addTodoButtonState) {
      return todoButton(
        setTodoModalVisible,
        setPassiveAssignmentModalVisible,
        setImportant,
        setUrgent
      );
    }
    if (addTaskButtonState) {
      return taskButton(setTaskModalVisible);
    }
  };

  // Header left component
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
        router={router}
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
      <AddPassiveAssignmentModal
        setTodos={setTodos}
        refreshTodos={refreshTodos}
        modalVisible={passiveAssignmentModalVisible}
        setModalVisible={setPassiveAssignmentModalVisible}
        categories={categories}
        setCategories={setCategories}
        router={router}
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
