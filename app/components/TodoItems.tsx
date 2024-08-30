import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Link, useFocusEffect } from "expo-router";
import { primaryColor } from "../helpers/constants";
import { getTaskCount } from "../services/db_service";

const TodoListHeader = ({ todoCount }) => {
  return (
    <View style={styles.listHeaderContainer}>
      <Text style={styles.listHeaderTitle}>My to-dos</Text>
      <Text style={styles.listHeaderDescription}>
        {todoCount === 0
          ? 'To add a new todo, tab the "Add Todo" button.'
          : "Tap on a todo to view its details."}
      </Text>
    </View>
  );
};

const fetchTaskCount = async (todoId) => {
  try {
    const count = await getTaskCount(todoId);
    return count;
  } catch (error) {
    console.error("Error fetching task count:", error);

    // Return 0 if there's an error
    return 0;
  }
};

const TodoItem = ({ item, todos, refreshTodos, refresh }) => {
  const [taskCount, setTaskCount] = useState(null);

  useEffect(() => {
    const getCount = async () => {
      const count = await fetchTaskCount(item.id);
      setTaskCount(count);
    };

    getCount();
  }, [item.id, refresh]);

  return (
    <Link
      style={styles.linkContainer}
      href={{
        pathname: "/todo_details",
        params: {
          title: item.title,
          id: item.id,
          todos: todos,
          todoNotes: item.notes,
          refreshTodos: refreshTodos,
        },
      }}
    >
      <View style={styles.todoListContainer}>
        <View style={styles.todoIndexContainer}>
          <Text style={styles.todoIndexText}>{item.index_no}</Text>
        </View>
        <Text style={styles.todoTitle} ellipsizeMode="tail"
            numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.taskCountsContainer}>
          <Text style={styles.taskCountText}>
            <Text>{taskCount !== null ? taskCount : "Loading..."}</Text> Tasks
          </Text>
        </View>
      </View>
    </Link>
  );
};

export function TodoItems({ todos, refreshTodos }) {
  const [taskCount, setTaskCount] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Toggle the refresh state to trigger a re-fetch of the task count
      setRefresh((prev) => !prev);
    }, [])
  );

  return (
    <>
      <FlatList
        style={styles.listContainer}
        data={todos}
        renderItem={({ item }) => (
          <TodoItem
            item={item}
            todos={todos}
            refreshTodos={refreshTodos}
            refresh={refresh}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={TodoListHeader(todos.length)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
  linkContainer: {
    textAlign: "center",
    justifyContent: "flex-start",
  },
  todoListContainer: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignContent: "flex-start",
    justifyContent: "space-between",
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
  },
  todoIndexContainer: {
    width: 30,
    height: 30,
    fontSize: 16,
    borderRadius: 50,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FF5733",
  },
  todoIndexText: {
    color: "white",
    fontSize: 16,
    textAlign: "left",
    alignItems: "center",
    justifyContent: "center",
  },
  todoTitle: {
    flex: 1,
    fontSize: 18,
    textAlign: "left",
    alignContent: "center",
    justifyContent: "center",
    paddingTop: 3,
  },
  taskCountsContainer: {
    alignSelf: "flex-end",
    marginTop: -4,
    borderWidth: 1,
    borderRadius: 50,
    padding: 8,
    borderColor: primaryColor,
  },
  taskCountText: {
    color: primaryColor,
    fontSize: 12,
  },
  listHeaderContainer: {
    margin: 16,
  },
  listHeaderTitle: {
    fontSize: 36,
    fontWeight: "bold",
  },
  listHeaderDescription: {
    fontSize: 16,
    color: "gray",
  },
});
