import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
} from "react-native";
import {
  getAllTodos,
  getAllTasks,
  deleteTask,
  updateTodoCompleted,
} from "../services/db_service";
import { checkPassiveAssignmentCompletion } from "../services/api_service";
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
import { primaryColor } from "../helpers/constants";

const updateTodoCompletedHandler =
  (todoId, completedStatus, setCompletedStatus) => async () => {
    console.log("Updating todo completed status", todoId, completedStatus);
    // reverse the completed status
    completedStatus = completedStatus === 1 ? 0 : 1;
    console.log("Updated todo completed status", todoId, completedStatus);
    updateTodoCompleted(todoId, completedStatus);
    setCompletedStatus(completedStatus);
  };

const TaskListHeader = ({
  todoId,
  todoTitle,
  tasks,
  categoryName,
  categoryColor,
  completedStatus,
  setCompletedStatus,
}) => {
  return (
    <View style={styles.listHeaderContainer}>
      <View style={styles.headerStatusTitleContainer}>
        <View style={styles.todoCompleteContainer}>
          <Pressable
            style={styles.todoCompleteCircleContainer}
            onPress={updateTodoCompletedHandler(
              todoId,
              completedStatus,
              setCompletedStatus
            )}
          >
            {parseInt(completedStatus) === 1 ? (
              <Icon name="check-circle" style={styles.todoCompleteIcon} />
            ) : (
              <></>
            )}
          </Pressable>
        </View>

        <Text
          style={[
            styles.TodoTitle,
            completedStatus == 1 ? styles.TodoTitleCrossed : null,
          ]}
        >
          {todoTitle}
        </Text>
      </View>
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
  // Check if this task is an passive assignment
  // If it is, send a request to the server to check if it is completed
  useEffect(() => {
    if (task.is_passiveassign === 1 && task.pa_completed === 0) {
      checkPassiveAssignmentCompletion(task.uid, task.todo_id, task.id)
        .then((result) => {
          task.pa_completed = result.is_completed ? 1 : 0;
        })
        .catch((error) => {
          console.log("Error checking passive assignment completion: ", error);
        });
    }
  }, []);

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
              {task.is_passiveassign === 1 ? (
                <Text style={styles.passiveAssignText}>Passive Assignment</Text>
              ) : (
                <Text style={styles.duration}>{task.duration}m</Text>
              )}
            </View>
            <View style={styles.attributeContainer}>
              <Icon
                name="calendar"
                size={16}
                color="gray"
                style={styles.iconContainer}
              />
              {task.is_passiveassign === 1 ? (
                <Text style={styles.timestamp}>
                  {task.pa_completed == 1 ? "Completed" : "Pending"}
                </Text>
              ) : (
                <Text style={styles.timestamp}>{task.scheduled_at}</Text>
              )}
            </View>
          </View>
        </LongPressGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
};

const TaskList = ({
  tasks,
  todoId,
  todoTitle,
  onLongPress,
  categoryName,
  categoryColor,
  completedStatus,
  setCompletedStatus,
}) => {
  return (
    <FlatList
      style={styles.listContainer}
      data={tasks}
      renderItem={({ item, index }) => (
        <TaskItem task={item} index={index} onLongPress={onLongPress} />
      )}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={TaskListHeader({
        todoId,
        todoTitle,
        tasks,
        categoryName,
        categoryColor,
        completedStatus,
        setCompletedStatus,
      })}
      ListFooterComponent={TaskListFooter}
    />
  );
};

export const TaskItems = ({
  tasks,
  todoId,
  todoTitle,
  refreshTasks,
  todos,
  categoryName,
  categoryColor,
  completedStatus,
  setCompletedStatus,
}) => {
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
          todoId={todoId}
          todoTitle={todoTitle}
          onLongPress={onLongPress}
          categoryName={categoryName}
          categoryColor={categoryColor}
          completedStatus={completedStatus}
          setCompletedStatus={setCompletedStatus}
        />
      );
    } else {
      return (
        <NoAssignedTasks
          todoTitle={todoTitle}
          refreshTasks={refreshTasks}
          has_completed={completedStatus}
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
    flex: 12,
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
  todoCompleteContainer: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    paddingRight: 10,
  },
  todoCompleteCircleContainer: {
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "green",
  },
  todoCompleteIcon: {
    textAlign: "center",
    color: "green",
    fontSize: 26,
  },
  headerStatusTitleContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  passiveAssignText: {
    flex: 1,
    textAlign: "center",
    fontSize: 8,
    color: primaryColor,
  },
});
