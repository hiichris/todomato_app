import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { getAllTodos, getAllTasks, deleteTask } from "../services/db_service";
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  LongPressGestureHandlerStateChangeEvent,
  State,
} from "react-native-gesture-handler";
import { TaskPieChart } from "./TaskPieChart";
import { NoAssignedTasks } from "./NoAssignTasks";

import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Tasks } from "./Tasks";
import { Link } from "expo-router";

const TaskListHeader = ({ todoTitle, tasks }) => {
  return (
    <View style={styles.listHeaderContainer}>
      <Text style={styles.TodoTitle}>{todoTitle}</Text>

      {/* Add a PieChart if tasks exist */}
      {tasks.length > 0 ? (
        <View>
          <Text style={styles.assignedTasksText}>
            You have {tasks.length} task(s) assigned.
          </Text>
          <TaskPieChart tasks={tasks} />
        </View>
      ) : (
        <View></View>
      )}
    </View>
  );
};

const TaskListFooter = () => {
  return (
    <View style={styles.listFooterContainer}>
      <Text style={styles.longPressText}>
        💡Long-press on each task to remove it.
      </Text>
    </View>
  );
};

const TaskItem = ({ task, index, onLongPress }) => {
  return (
    <GestureHandlerRootView style={styles.taskItemsContainer}>
      {/* Wrap a Longpress component here to remove the item */}
      <LongPressGestureHandler
        onHandlerStateChange={onLongPress(task.id, index)}
        minDurationMs={800}
      >
        <View style={styles.taskItemContainer}>
          <View style={styles.taskIndexContainer}>
            <Text>{index + 1}</Text>
          </View>
          <Text style={styles.taskName} ellipsizeMode="tail" numberOfLines={2}>
            {task.name}
          </Text>
          <View style={styles.attributeContainer}>
            <Text style={styles.iconContainer}>⏱️</Text>
            <Text style={styles.duration}>{task.duration}s</Text>
          </View>
          <View style={styles.attributeContainer}>
            <Text style={styles.iconContainer}>🏁</Text>
            <Text style={styles.timestamp}>08/01/24 10:12p</Text>
          </View>
        </View>
      </LongPressGestureHandler>
    </GestureHandlerRootView>
  );
};

const TaskList = ({ tasks, todoTitle, onLongPress }) => {
  return (
    <FlatList
      style={styles.listContainer}
      data={tasks}
      renderItem={({ item, index }) => (
        <TaskItem task={item} index={index} onLongPress={onLongPress} />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={TaskListHeader({ todoTitle, tasks })}
      ListFooterComponent={TaskListFooter}
    />
  );
};

export const TaskItems = ({ tasks, todoTitle, refreshTasks, todos }) => {
  const onLongPress =
    (taskId, index) => (event: LongPressGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.state === State.ACTIVE) {
        // get current event id
        Alert.alert(
          "Delete Task",
          `Are you sure you want to delete #${index + 1} task?`,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "OK",
              onPress: async () => {
                console.log("Deleting task: ", taskId);
                deleteTask(tasks, taskId)
                  .then((result) => {
                    console.log("Task deleted: ", result);
                    refreshTasks();
                  })
                  .catch((error) => {
                    console.log("Error: ", error);
                  });
              },
            },
          ]
        );
      }
    };
  {
    if (tasks.length > 0) {
     return (<TaskList tasks={tasks} todoTitle={todoTitle} onLongPress={onLongPress} />);
    } else {
      return (
        <NoAssignedTasks
        todoTitle={todoTitle}
        refreshTasks={refreshTasks}
      />
      )
    }
  }
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  taskItemsContainer: {
    borderBottomColor: "#f0f0f0",
  },
  TodoTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  listHeaderContainer: {
    margin: 8,
  },
  assignedTasksText: {
    marginBottom: 16,
    color: "gray",
  },
  taskItemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderColor: "lightgrey",
    height: 60,
  },
  taskIndexContainer: {
    backgroundColor: "#FFC6B2",
    marginRight: 8,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#FF5733",
  },
  taskName: {
    flex: 8,
    fontSize: 16,
    textAlign: "left",
    justifyContent: "center",
  },
  duration: {
    flex: 1,
    alignItems: "center",
    fontSize: 10,
    margin: 4,
    paddingTop: 4,
  },
  listFooterContainer: {},
  longPressText: {
    flex: 1,
    color: "gray",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  timestamp: {
    textAlign: "center",
    fontSize: 10,
  },
  attributeContainer: {
    flex: 2,
    flexDirection: "column",
    alignItems: "center",
  },
  iconContainer: {
    alignSelf: "stretch",
    textAlign: "center",
  },
});
