import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Link, useFocusEffect } from "expo-router";
import { primaryColor } from "../helpers/constants";
import { getTaskCount } from "../services/db_service";


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
        <Text style={styles.todoTitle} ellipsizeMode="tail">
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
      setRefresh((prev) => !prev); // Toggle the refresh state to trigger a re-fetch
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
    marginVertical: 8,
    textAlign: "left",
    justifyContent: "flex-start",
  },
  todoListContainer: {
    width: "100%",
    flexDirection: "row",
    padding: 8,
    alignContent: "flex-start",
    justifyContent: "space-between",
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
    alignContent: "flex-start",
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
});
