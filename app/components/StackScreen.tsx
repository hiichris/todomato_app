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
  refreshTodoItems = null,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SQLiteProvider databaseName="test.db" onInit={migrateDbIfNeeded}>
      <View style={styles.stackContainer}>
        <Stack.Screen
          options={{
            title: title,
            headerRight: () => (
              <Pressable
                onPress={() => {
                  console.log("Set modal visible");
                  setModalVisible(true);
                }}
              >
                <Text style={styles.naviButton}>Add</Text>
              </Pressable>
            ),
          }}
        ></Stack.Screen>
        <AddTodoModal
          todos={todos}
          setTodos={setTodos}s
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
      </View>
    </SQLiteProvider>
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
