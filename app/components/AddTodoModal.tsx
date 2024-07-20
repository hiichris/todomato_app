import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../helpers/constants";
import { addNewTodo } from "../services/db_service";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded, getAllTodos } from "../services/db_service";
import { Todo } from "../models/todo";

export default function AddTodoModal({
  modalVisible,
  setModalVisible,
  setTodos,
  refreshTodos,
}) {
  const [todoTitle, setTodoTitle] = React.useState("");

  return (
    <SQLiteProvider databaseName="todos.db" onInit={migrateDbIfNeeded}>
      <SafeAreaView>
      
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
           <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.centeredView}
            >
            <ScrollView style={styles.centeredView}>
            
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              
                <View style={styles.modalView}>
                  <View style={styles.modalHeaderContainer}>
                    <Text style={styles.headerText}>Create Todo</Text>
                    <Pressable
                      style={styles.closeCirleButton}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.closeCircleText}>X</Text>
                    </Pressable>
                  </View>
                  <View style={styles.modalBodyContainer}>
                    <View style={styles.inputContiner}>
                      <Text style={styles.modalText}>Todo Title:</Text>
                      <TextInput
                        style={styles.modalTextInput}
                        onChangeText={setTodoTitle}
                        value={todoTitle}
                      />
                      <Text>  </Text>
                    </View>

                    <View style={styles.buttonsContainer}>
                      <Pressable
                        style={[styles.button, styles.buttonCreate]}
                        onPress={() => {
                          console.log("todoTitle: ", todoTitle);

                          addNewTodo(setTodos, todoTitle)
                            .then((result) => {
                              console.log("result: ", result);
                              refreshTodos();
                            })
                            .catch((error) => {
                              console.log("Error: ", error);
                            });

                          // Clear the todoTitle
                          setTodoTitle("");

                          setModalVisible(!modalVisible);
                        }}
                      >
                        <Text style={styles.textStyle}>Create</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={{ flexGrow: 2 }}></View>
                </View>
               
              </TouchableWithoutFeedback>
            </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
     
      </SafeAreaView>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
  },
  modalView: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
    marginTop: Dimensions.get("window").height / 2,
    backgroundColor: "rgba(255, 87, 51, 0.95)",
    borderRadius: 20,
    padding: 16,
    paddingTop: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonsContainer: {
    margin: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 12,
    margin: 8,
    elevation: 2,
  },
  buttonCreate: {
    backgroundColor: "#B2361B",
    borderColor: "white",
    borderWidth: 1,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalText: {
    flex: 2,
    textAlign: "center",
    color: "white",
  },
  modalTextInput: {
    flex: 4,
    height: 40,
    width: Dimensions.get("window").width - 32,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 8,
    color: "white",
  },
  inputContiner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBodyContainer: {
    flex: 8,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: -38,
  },
  closeCirleButton: {
    marginTop: -38,
    position: "absolute",
    left: Dimensions.get("window").width / 2,
    top: 16,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
  },
  closeCircleText: {
    color: primaryColor,
    fontWeight: "bold",
    fontSize: 10,
    width: 13,
    textAlign: "center",
  },

});
