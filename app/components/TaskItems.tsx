import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { getAllTodos, getAllTasks } from "../services/db_service";
import { Task } from "../models/task";
import { Todo } from "../models/todo";
import { Tasks } from "./Tasks";
import { Link } from "expo-router";

export function TaskItems({ todo_id, tasks, setTasks }) {
  const db = useSQLiteContext();

  useEffect(() => {
    async function runQuery() {
      try {
        const tasks = await getAllTasks(db, todo_id);
        console.log("Tasks: ", tasks);
        setTasks(tasks);
      } catch (error) {
        console.log("Error: ", error);
      }
    }

    runQuery();
  }, []);

  return (
    <>
      <FlatList
        style={styles.listContainer}
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItemContainer}>
            <Link
              style={{ flex: 1 }}
              href={{
                pathname: "/todo_details",
                params: {
                  title: item.title,
                  id: item.id,
                  todos: tasks,
                  setTodos: setTasks,
                },
              }}
            >
              {`${item.name}, duration: ${item.duration}`}
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
