import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { primaryColor } from "../helpers/constants";
import { getTaskCount } from "../services/db_service";
import Icon from "react-native-vector-icons/FontAwesome";

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
      style={({ pressed }) => [
        styles.todoItemsContainer,
        {
          backgroundColor: pressed ? "lightgray" : "transparent",
        },
      ]}
      onPress={routingTodoDetailHandler}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.todoTitle} ellipsizeMode="tail" numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.subSectionContainer}>
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
          <View style={styles.attributesContainer}>
            <View style={styles.attributeContainer}>
              <Icon
                name="sticky-note"
                style={styles.attributeIcon}
                color="gray"
              />
              <Text style={styles.attributeText}>{item.has_notes}</Text>
            </View>

            <View style={styles.attributeContainer}>
              <Icon name="image" style={styles.attributeIcon} color="gray" />
              <Text style={styles.attributeText}>{item.image_count}</Text>
            </View>

            <View style={styles.attributeContainer}>
              <Icon name="map-pin" style={styles.attributeIcon} color="gray" />
              <Text style={styles.attributeText}>{item.has_geolocation}</Text>
            </View>
          </View>
        </View>
      </View>
      {/* </Link> */}
      <View style={styles.taskCountsContainer}>
        <Text style={styles.taskCountText}>
          <Text style={styles.taskCountNumber}>{taskCount !== null ? taskCount : "..."}</Text> Tasks
        </Text>
      </View>
    </Pressable>
  );
};

export function TodoItems({ todos, refreshTodos }) {
  const [refresh, setRefresh] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Toggle the refresh state to trigger a re-fetch of the task count
      setRefresh((prev) => !prev);
    }, [])
  );

  return (
    <>
      {todos.length > 0 ? (
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
      ) : (
        <View style={styles.listHeaderContainer}>
          <Text style={styles.listHeaderTitle}>My to-dos</Text>
          <Text style={styles.listHeaderDescription}>
            To add a new todo, tap the "Add Todo" button.
          </Text>
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>
              😅 Uh oh! There's no matching to-dos.
            </Text>
          </View>
        </View>
      )}
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
    alignContent: "space-between",
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
    width: 80,
    borderRadius: 20,
  },
  subSectionContainer: {
    justifyContent: "flex-start",
    alignContent: "center",
    flexDirection: "row",
    marginVertical: 4,
    padding: 2,
  },
  categoryText: {
    fontSize: 10,
    color: "white",
    textAlign: "center",
  },
  attributesContainer: {
    flexDirection: "row",
    marginRight: 4,
  },
  attributeIcon: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  attributeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  attributeText: {
    fontSize: 10,
    color: "gray",
    fontWeight: "bold",
  },
  notFoundContainer: {
    marginVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  notFoundText: {
    fontSize: 14,
    color: primaryColor,
  },
  taskCountNumber: {
    fontWeight: "bold",
  }
});
