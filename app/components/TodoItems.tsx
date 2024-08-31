import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Link, useFocusEffect, useRouter } from "expo-router";
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

const TodoItem = ({ index, item, todos, refreshTodos, refresh }) => {
  const [taskCount, setTaskCount] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getCount = async () => {
      const count = await fetchTaskCount(item.id);
      setTaskCount(count);
    };

    getCount();
  }, [item.id, refresh]);

  const routingTodoDetailHandler = () => {
    router.push({
      pathname: "/todo_details",
      params: {
        title: item.title,
        id: item.id,
        todos: todos,
        todoNotes: item.notes,
        refreshTodos: refreshTodos,
      },
    });
  };

  return (
    <Pressable
      style={styles.todoItemsContainer}
      onPress={routingTodoDetailHandler}
    >
      {/* <View style={styles.todoIndexContainer}>
        <Text style={styles.todoIndexText}>{index + 1}</Text>
      </View> */}
      <View style={styles.titleContainer}>
        <Text style={styles.todoTitle} ellipsizeMode="tail" numberOfLines={2}>
          {item.title}
        </Text>
        <View
          style={[
            styles.categoryContainer,
            {
              backgroundColor:
                item.category_color === null
                  ? "transparent"
                  : item.category_color,
            },
          ]}
        >
          <Text style={styles.categoryText}>{item.category_name}</Text>
        </View>
      </View>
      {/* </Link> */}
      <View style={styles.taskCountsContainer}>
        <Text style={styles.taskCountText}>
          {taskCount !== null ? taskCount : "Loading..."} Tasks
        </Text>
      </View>
    </Pressable>
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
        style={styles.todosListContainer}
        data={todos}
        renderItem={({ index, item }) => (
          <TodoItem
            index={index}
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
  todoItemsContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderColor: "lightgrey",
    alignItems: "center",
    alignContent: "center",
    height: 80,
    borderBottomWidth: 1,
  },
  todosListContainer: {
    flex: 1,
    marginBottom: 24,
  },
  todoIndexContainer: {
    justifyContent: "center",
    width: 26,
    height: 26,
    borderRadius: 50,
    backgroundColor: primaryColor,
    marginRight: 8,
  },
  titleContainer: {
    flex: 8,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  todoIndexText: {
    textAlign: "center",
    color: "white",
    fontSize: 10,
  },
  todoItemContainer: {},
  todoTitle: {
    fontSize: 18,
    textAlign: "left",
    alignContent: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
    marginRight: 8,
  },
  taskCountsContainer: {
    flex: 2,
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderColor: primaryColor,
  },
  taskCountText: {
    color: primaryColor,
    fontSize: 10,
    textAlign: "center",
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
  categoryContainer: {
    marginTop: 4,
    width: 80,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 10,
    color: "white",
    textAlign: "center",
  },
});
