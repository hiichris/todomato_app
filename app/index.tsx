import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from "expo-sqlite";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import { migrateDbIfNeeded } from "./services/db-service";
import { TodoItems } from "./components/TodoItems";

export default function App() {
  return (
    <View style={styles.container}>
      <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
        <TodoItems />
      </SQLiteProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 20,
  },
  contentContainer: {
    padding: 20,
  },
  todoItemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
