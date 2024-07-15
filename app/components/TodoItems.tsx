import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Link } from "expo-router";

export function TodoItems({ todos, refreshTodos }) {
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
              params: { 
                title: item.title, 
                id: item.id,
                todos: todos,
                refreshTodos: refreshTodos,
              },
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
