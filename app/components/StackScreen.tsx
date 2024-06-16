import { Stack, Link } from "expo-router";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import { useState } from "react";
import { Text, StyleSheet, Pressable, Modal, View } from "react-native";

import AddTodoModal from "./AddTodoModal";
import { primaryColor } from "../helpers/constants";
import { BorderlessButton } from "react-native-gesture-handler";
import { migrateDbIfNeeded } from "../services/db_service";

export default function StackScreen({
  title,
  todos,
  setTodos,
  addTodoButton,
  refreshTodoItems = null,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const dbContext = useSQLiteContext();


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
  }

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
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          dbContext={dbContext}
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
