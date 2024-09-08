import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Switch,
  Platform,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { primaryColor } from "../helpers/constants";
import { getTaskCount, updateTodoCompleted } from "../services/db_service";
import Icon from "react-native-vector-icons/FontAwesome";

// Switch component to toggle the show completed tasks
const SwitchShowCompleted = ({ isEnabled, toggleSwitch }) => {
  return (
    <View style={styles.switchContainer}>
      <Switch
        style={styles.switchControl}
        trackColor={{ false: "#767577", true: primaryColor }}
        thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      <Text style={[styles.switchDescription]}>Show Completed</Text>
    </View>
  );
};

// Header component for the todo list
const TodoListHeader = ({ todoCount, toggleSwitch, isEnabled }) => {
  return (
    <View style={styles.listHeaderContainer}>
      <Text style={styles.listHeaderTitle}>My to-dos</Text>
      <Text style={styles.listHeaderDescription}>
        {todoCount === 0
          ? 'To add a new todo, tab the "Add Todo" button.'
          : "Tap on a todo to view its details."}
      </Text>
      <SwitchShowCompleted isEnabled={isEnabled} toggleSwitch={toggleSwitch} />
    </View>
  );
};

// Footer component for the todo list
const TodoListFooter = ({ todoCount }) => {
  // if todoCount is 0, show a message
  return todoCount === 0 ? (
    <View style={styles.notFoundContainer}>
      <Text style={styles.notFoundText}>
        😅 Uh oh! There's no matching to-dos.
      </Text>
    </View>
  ) : (
    <></>
  );
};

// Fetch the task count for a todo
const fetchTaskCount = async (todoId) => {
  try {
    const count = await getTaskCount(todoId);
    return count;
  } catch (error) {
    console.log("Error fetching task count:", error);

    // Return 0 if there's an error
    return 0;
  }
};

// Update the todo completed status
const updateTodoCompletedHandler =
  (todoId, isCompleted, refreshTodos, isEnabled) => async () => {
    console.log("Updating todo completed status", todoId, isCompleted);
    // Reverse the completed status
    isCompleted = isCompleted === 1 ? 0 : 1;
    console.log("Updated todo completed status", todoId, isCompleted);
    // Update the todo completed status in the database
    updateTodoCompleted(todoId, isCompleted);
    refreshTodos(isEnabled);
  };

const TodoItem = ({
  index,
  item,
  todos,
  refreshTodos,
  refresh,
  toggleSwitch,
  isEnabled,
}) => {
  const [taskCount, setTaskCount] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch the task count for the todo if refresh is triggered
    const getCount = async () => {
      const count = await fetchTaskCount(item.id);
      setTaskCount(count);
    };

    getCount();
  }, [item.id, refresh]);

  // Route to the todo details screen with params
  const routingTodoDetailHandler = () => {
    router.push({
      pathname: "/todo_details",
      params: {
        title: item.title,
        id: item.id,
        todos: todos,
        todoNotes: item.notes,
        categoryName: item.category_name,
        categoryColor: item.category_color,
        has_completed: item.has_completed,
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
      <View style={styles.todoCompleteContainer}>
        <Pressable
          style={styles.todoCompleteCircleContainer}
          onPress={updateTodoCompletedHandler(
            item.id,
            item.has_completed,
            refreshTodos,
            isEnabled
          )}
        >
          {item.has_completed === 1 ? (
            <Icon name="check-circle" style={styles.todoCompleteIcon} />
          ) : (
            <></>
          )}
        </Pressable>
      </View>
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.todoTitle,
            item.has_completed == 1 ? styles.todoTitleCrossed : null,
          ]}
          ellipsizeMode="tail"
          numberOfLines={2}
        >
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

      {/* Tasks indicator */}
      <View style={styles.taskCountsContainer}>
        <Text style={styles.taskCountText}>
          <Text style={styles.taskCountNumber}>
            {taskCount !== null ? taskCount : "..."}
          </Text>{" "}
          Tasks
        </Text>
      </View>
    </Pressable>
  );
};

export function TodoItems({ todos, refreshTodos, toggleSwitch, isEnabled }) {
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
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <TodoListHeader
            todoCount={todos.length}
            toggleSwitch={toggleSwitch}
            isEnabled={isEnabled}
          />
        )}
        ListFooterComponent={() => <TodoListFooter todoCount={todos.length} />}
        renderItem={({ index, item }) => (
          <TodoItem
            index={index}
            item={item}
            todos={todos}
            refreshTodos={refreshTodos}
            refresh={refresh}
            isEnabled={isEnabled}
          />
        )}
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
  titleContainer: {
    flex: 8,
    flexDirection: "column",
    justifyContent: "space-between",
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
  todoTitleCrossed: {
    textDecorationLine: "line-through",
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
    flex: 1,
    margin: 16,
    justifyContent: "space-evenly",
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
    flex: 15.5,
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  notFoundText: {
    fontSize: 14,
    color: primaryColor,
    marginTop: 24,
  },
  taskCountNumber: {
    fontWeight: "bold",
  },
  switchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 8,
    marginBottom: -8,
  },
  switchControl: {
    transform: Platform.OS === "ios" ? [{ scale: 0.8 }] : [{ scale: 1.2 }],
    padding: 0,
    margin: 0,
    marginLeft: -8,
    marginTop: -4,
  },
  switchDescription: {
    flex: 1,
    fontSize: 12,
    color: "gray",
    marginLeft: 4,
    alignContent: "center",
    justifyContent: "center",
    paddingBottom: 6,
  },
});
