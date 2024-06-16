import { Stack, Link } from "expo-router";
import { useState } from "react";
import { Text, StyleSheet, Pressable, Modal, View } from "react-native";

import AddTodoModal from "./AddTodoModal";

export default function StackScreen({ title }) {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <>
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
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  naviButton: {
    color: "red",
    marginRight: 10,
  },
});
