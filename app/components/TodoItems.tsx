import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { getAllTodos } from "../services/db_service";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Link } from "expo-router";

export function TodoItems({ todos, setTodos}) {
  const db = useSQLiteContext();

  useEffect(() => {
    async function runQuery() {
      setTodos(await getAllTodos(db));
    }

    runQuery();
  }, []);

  return (
    <>
    <FlatList
      style={styles.listContainer}
      data={todos}
      renderItem={({ item }) => (
        <View style={styles.taskItemContainer}>
          <Link
            style={{ flex: 1 }}
            href={{
              pathname: "/todo_details",
              params: { title: item.title.substring(0, 10), id: item.id },
            }}
          >
            {`${item.index_no} - ${item.title}`}
          </Link>
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  taskItemContainer: {
    padding: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
