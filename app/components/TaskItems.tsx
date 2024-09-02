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
import Icon from "react-native-vector-icons/FontAwesome";
import { TodoSearchBar } from "./TodoSearchBar";

import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Tasks } from "./Tasks";
import { Link } from "expo-router";

const TaskListHeader = ({
  todoTitle,
  tasks,
  categoryName,
  categoryColor,
  has_completed,
}) => {
  console.log("aaa has_completed: ", has_completed);
  return (
    <View style={styles.listHeaderContainer}>
      <Text
        style={[
          styles.TodoTitle,
          has_completed == 1 ? styles.TodoTitleCrossed : null,
        ]}
      >
        {todoTitle}
      </Text>
      <View
        style={[
          styles.categoryContainer,
          {
            backgroundColor: categoryColor,
          },
        ]}
      >
        <Text style={styles.categoryName}>{categoryName}</Text>
      </View>
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
    <View style={styles.taskItemsContainer}>
      <GestureHandlerRootView>
        {/* Wrap a Longpress component here to remove the item */}
        <LongPressGestureHandler
          onHandlerStateChange={onLongPress(task.id, index)}
          minDurationMs={800}
        >
          <View style={styles.taskItemContainer}>
            <View style={styles.taskIndexContainer}>
              <Text>{index + 1}</Text>
            </View>
            <Text
              style={styles.taskName}
              ellipsizeMode="tail"
              numberOfLines={2}
            >
              {task.name}
            </Text>
            <View style={styles.attributeContainer}>
              <Icon
                name="clock-o"
                size={16}
                color="gray"
                style={styles.iconContainer}
              />
              <Text style={styles.duration}>{task.duration}m</Text>
            </View>
            <View style={styles.attributeContainer}>
              <Icon
                name="calendar"
                size={16}
                color="gray"
                style={styles.iconContainer}
              />
              <Text style={styles.timestamp}>{task.scheduled_at}</Text>
            </View>
          </View>
        </LongPressGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
};

const TaskList = ({
  tasks,
  todoTitle,
  onLongPress,
  categoryName,
  categoryColor,
  has_completed,
}) => {
  console.log("has_completed: ", has_completed);
  return (
    <FlatList
      style={styles.listContainer}
      data={tasks}
      renderItem={({ item, index }) => (
        <TaskItem task={item} index={index} onLongPress={onLongPress} />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={TaskListHeader({
        todoTitle,
        tasks,
        categoryName,
        categoryColor,
        has_completed,
      })}
      ListFooterComponent={TaskListFooter}
    />
  );
};

export const TaskItems = ({
  tasks,
  todoTitle,
  refreshTasks,
  todos,
  categoryName,
  categoryColor,
  has_completed,
}) => {
  console.log("---has_completed: ", has_completed);
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
      return (
        <TaskList
          tasks={tasks}
          todoTitle={todoTitle}
          onLongPress={onLongPress}
          categoryName={categoryName}
          categoryColor={categoryColor}
          has_completed={has_completed}
        />
      );
    } else {
      return (
        <NoAssignedTasks
          todoTitle={todoTitle}
          refreshTasks={refreshTasks}
          has_completed={has_completed}
        />
      );
    }
  }
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  taskItemsContainer: {
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
    marginHorizontal: 4,
  },
  TodoTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    height: 80,
  },
  TodoTitleCrossed: {
    textDecorationLine: "line-through",
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
    height: 70,
  },
  taskIndexContainer: {
    backgroundColor: "lightgray",
    marginRight: 8,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderColor: "gray",
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
    fontSize: 8,
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
    flex: 1,
    textAlign: "center",
    fontSize: 8,
  },
  attributeContainer: {
    flex: 3,
    flexDirection: "column",
    alignItems: "center",
  },
  iconContainer: {
    flex: 1,
    textAlign: "center",
  },
  categoryContainer: {
    justifyContent: "center",
    alignContent: "center",
    width: 100,
    backgroundColor: "gray",
    borderRadius: 50,
    marginVertical: 8,
  },
  categoryName: {
    color: "white",
    textAlign: "center",
  },
});
