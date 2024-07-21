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
          <Link
            style={styles.linkContainer}
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
            <View style={styles.todoListContainer}>
              <View style={styles.todoIndex}>
                <Text style={styles.todoIndexText}>{item.index_no}</Text>
              </View>
              <Text style={styles.todoTitle}>{item.title}</Text>
            </View>

          </Link>
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
    flex: 1,
    marginVertical: 8,
  },
  todoListContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
    
  },
  todoIndex: {
    width: 30,
    height: 30,
    fontSize: 16,
    borderRadius: 50,
    textAlign: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FF5733",
  },
  todoIndexText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    justifyContent: "center",
  },
  todoTitle: {
    fontSize: 16,
    textAlign: "center",
    justifyContent: "center",
    marginTop: 4,
  }
});
