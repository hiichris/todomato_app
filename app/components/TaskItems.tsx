import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { getAllTodos, getAllTasks, deleteTask } from "../services/db_service";
import { GestureHandlerRootView, LongPressGestureHandler, LongPressGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import { TaskPieChart } from "./TaskPieChart";

import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Tasks } from "./Tasks";
import { Link } from "expo-router";


function ListHeaderComponent({ todoTitle, tasks }) {
  return (
    <View style={styles.listHeaderContainer}>
      <Text style={styles.TodoTitle}>{todoTitle}</Text>

      {/* Add a PieChart if tasks exist */}
      {tasks.length > 0 ?
        <View>
          <Text style={styles.assignedTasksText}>You have {tasks.length} task(s) assigned.</Text>
          <TaskPieChart tasks={tasks} />
        </View>
        : <View></View>}
    </View>

  );
}

function ListFooterComponent() {
  return (
    <View style={styles.listFooterContainer}>
      <Text style={styles.longPressText}>
        Long-press on each task to remove it.
      </Text>
    </View>
  );
}

function TaskItem({ task, index, onLongPress }) {

  return (
    <GestureHandlerRootView style={styles.taskItemsContainer}>
      {/* Wrap a Longpress component here to remove the item */}
      <LongPressGestureHandler onHandlerStateChange={onLongPress(task.id)}
        minDurationMs={800}>
        <View style={styles.taskItemContainer}>
          <View style={styles.taskIndexContainer}>
            <Text>{index + 1}</Text>
          </View>
          <Text style={styles.taskName}
            ellipsizeMode="tail"
            numberOfLines={1}
          >{task.name}</Text>
          <Text style={styles.duration}>⏲️: {task.duration}s</Text>
        </View>
      </LongPressGestureHandler>

    </GestureHandlerRootView>
  )
}

function TaskList({ tasks, todoTitle, onLongPress }) {
  return (
    <FlatList
      style={styles.listContainer}
      data={tasks}
      renderItem={({ item, index }) => (
        <TaskItem task={item} index={index} onLongPress={onLongPress} />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent({ todoTitle, tasks })}
      ListFooterComponent={ListFooterComponent}
    />
  )
}

export function TaskItems({ tasks, todoTitle, refreshTasks }) {

  const onLongPress = (taskId) => (event: LongPressGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      // get current event id
      Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            console.log("Deleting task: ", taskId);
            deleteTask(tasks, taskId).then(
              (result) => {
                console.log("Task deleted: ", result);
                refreshTasks();
              }
            ).catch(
              (error) => {
                console.log("Error: ", error);
              }
            );
          }
        }
      ]);
    }
  }

  return (
    <TaskList tasks={tasks} todoTitle={todoTitle} onLongPress={onLongPress} />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  taskItemsContainer: {
    borderBottomColor: "#f0f0f0",
  },
  TodoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  listHeaderContainer: {
    margin: 16,
  },
  assignedTasksText: {
    marginBottom: 16,
  },
  taskItemContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    borderRadius: 50,
    margin: 2,
    backgroundColor: "#FFEBE4",
    borderWidth: 1,
    borderColor: "#FFC6B2",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  taskIndexContainer: {
    backgroundColor: "#FFC6B2",
    marginRight: 8,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  taskName: {
    flex: 4,
  },
  duration: {
    flex: 1,
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  listFooterContainer: {
  },
  longPressText: {
    flex: 1,
    color: "gray",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  }

});
