import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { getAllTasks } from "../services/db-service";
import { Task } from "../models/task";
import { Link } from "expo-router";

export function TodoItems() {
  const db = useSQLiteContext();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function runQuery() {
      setTasks(await getAllTasks(db));
    }

    runQuery();
  }, []);

  return (
    <FlatList
      style={styles.listContainer}
      data={tasks}
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
