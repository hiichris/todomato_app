import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getAllTodoItems } from "../services/db-service";
import { Todo } from "../models/todo";

export function TodoItems() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    async function runQuery() {
      setTodos(await getAllTodoItems(db));
    }

    runQuery();
  }, []);

  return (
    <View style={styles.contentContainer}>
      {todos.map((todo, index) => (
        <View style={styles.todoItemContainer} key={index}>
          <Text>{`${todo.intValue} - ${todo.value}`}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
  todoItemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
