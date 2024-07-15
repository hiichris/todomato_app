import { Stack, Link } from "expo-router";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import { useState } from "react";
import { Text, StyleSheet, Pressable, Modal, View, Button } from "react-native";

import AddTodoModal from "./AddTodoModal";
import { primaryColor } from "../helpers/constants";
import { migrateDbIfNeeded } from "../services/db_service";

export default function StackScreen({
  title,
  todos,
  setTodos,
  refreshTodos,
  addTodoButton,
  refreshTodoItems = null
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const todoButton = () => {
    return (
      <Pressable
        onPress={() => {
          console.log("Set modal visible");
          setModalVisible(true);
        }}
      >
        <Text style={styles.naviButton}>Add</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.stackContainer}>
      <Stack.Screen
        options={{
          title: title,
          headerRight: () => {
            if (addTodoButton) {
              return todoButton();
            }
          },
        }}
      ></Stack.Screen>
      <AddTodoModal
        todos={todos}
        setTodos={setTodos}
        refreshTodos={refreshTodos}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  naviButton: {
    color: primaryColor,
    marginRight: 10,
  },
  stackContainer: {
    height: 0,
  },
});
