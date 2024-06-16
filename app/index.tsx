import { SQLiteProvider } from "expo-sqlite";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Modal,
  Pressable,
} from "react-native";

import { migrateDbIfNeeded } from "./services/db-service";
import { TodoItems } from "./components/TodoItems";
import StackScreen from "./components/StackScreen";

export default function App() {
  
  return (
    <View style={styles.container}>
        
      <StackScreen title="Todomato" />
      <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
        <View style={styles.tasksContainer}>
          <TodoItems />
        </View>
      </SQLiteProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tasksContainer: {
    flex: 10,
    padding: 20,
  },
  naviButton: {
    color: "red",
    marginRight: 10,
  },
 
});
