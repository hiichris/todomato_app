import React, { useEffect, useState, useRef } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../helpers/constants";
import {
  addNewTask,
  addNewTodo,
  getCategories,
  getTodoById,
} from "../services/db_service";
import { SQLiteProvider } from "expo-sqlite";
import { Todo } from "../models/todo";
import { sendPassiveAssignmentRequest } from "../services/api_service";

export default function AddPassiveAssignmentModal({
  modalVisible,
  setModalVisible,
  setTodos,
  refreshTodos,
  router,
  categories,
  setCategories,
}) {
  const [todoTitle, setTodoTitle] = React.useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [yourName, setYourName] = React.useState("");
  const [asigneeName, setAsigneeName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [asigneeEmail, setAsigneeEmail] = React.useState("");
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [uid, setUid] = useState("");

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        inputRef.current?.measureLayout(scrollViewRef.current, (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: Dimensions.get("window").height - y - 20,
            animated: true,
          });
        });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const generateRandomId = (length = 16) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!^*_-";
    let result = "";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }

    return result;
  };

  const cleanupAndCloseModal = () => {
    setTodoTitle("");
    setSelectedCategory(null);
    setYourName("");
    setAsigneeName("");
    setTaskDescription("");
    setAsigneeEmail("");
    setModalVisible(!modalVisible);
  };

  const createPassiveAssignmentHandler = async () => {
    if (todoTitle === "") {
      Alert.alert("Todo Title is required");
      return;
    }
    if (selectedCategory === null) {
      Alert.alert("Please select a category");
      return;
    }
    if (yourName === "") {
      Alert.alert("Your Name is required");
      return;
    }
    if (asigneeName === "") {
      Alert.alert("Asignee Name is required");
      return;
    }
    if (taskDescription === "") {
      Alert.alert("Task Description is required");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (asigneeEmail === "" || !emailRegex.test(asigneeEmail)) {
      Alert.alert("Asignee Email is required and must be a valid email.");
      return;
    }

    console.log(
      "Creating new todo: ",
      todoTitle,
      selectedCategory,
      yourName,
      asigneeName,
      taskDescription,
      asigneeEmail
    );

    addNewTodo(setTodos, todoTitle, selectedCategory)
      .then((result) => {
        console.log("result: ", result);
        refreshTodos();

        // Get last inserted todo_id
        const todo_id = result?.lastInsertRowId;

        // Send the task to Passive Assignment Service API
        const uid = generateRandomId();

        // Add new task
        addNewTask(
          () => {},
          todo_id,
          taskDescription,
          0,
          new Date().toISOString(),
          1,
          0,
          uid
        )
          .then((result) => {
            console.log("Task added: ", result);
            const task_id = result?.lastInsertRowId;

            // Get todo details by id
            getTodoById(todo_id)
              .then((todo: Todo) => {
                console.log("Todo details: ", todo);

                // Clear the todoTitle
                cleanupAndCloseModal();

                sendPassiveAssignmentRequest(
                  uid,
                  todo_id,
                  task_id,
                  taskDescription,
                  yourName,
                  asigneeName,
                  asigneeEmail
                )
                  .then((response) => {
                    if (response) {
                      console.log(
                        "Passive Assignment Request Sent: ",
                        response
                      );
                    }
                  })
                  .catch((error) => {
                    console.log(
                      "Error sending passive assignment request: ",
                      error
                    );
                  });

                // Redirect to todo details page
                router.push({
                  pathname: "/todo_details",
                  params: {
                    title: todo.title,
                    id: todo.id,
                    todoNotes: todo.notes,
                    categoryName: todo.category_name,
                    categoryColor: todo.category_color,
                    has_completed: todo.has_completed,
                    refreshTodos: refreshTodos,
                  },
                });
              })
              .catch((error) => {
                console.log("Error during getTodoById: ", error);
              });
          })
          .catch((error) => {
            console.log("Error during addNewTask: ", error);
          });
      })
      .catch((error) => {
        console.log("Error during addNewTodo: ", error);
      });

    // Clear the todoTitle
    cleanupAndCloseModal();
  };

  const retrieveDBCategories = async () => {
    console.log("Retrieving categories");
    const dbCategories = await getCategories(false);
    setCategories(dbCategories);
  };

  const onFocusHandler = () => {
    if (selectedCategory === null) {
      Alert.alert("Please select a category first!");
      Keyboard.dismiss();
      return;
    }
  };

  return (
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
          <ScrollView
            style={styles.centeredView}
            ref={scrollViewRef}
            keyboardShouldPersistTaps="always"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalView}>
                <View style={styles.modalHeaderContainer}>
                  <Text style={styles.headerText}>Passive Assignment</Text>
                  <View style={styles.circleButtonContainer}>
                    <Pressable
                      style={styles.closeCirleButton}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.closeCircleText}>X</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.modalBodyContainer}>
                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Category:</Text>
                    <View style={styles.inputGroupContainer}>
                      <ScrollView
                        style={styles.categoryScrollView}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                      >
                        <View style={styles.categoryContainer}>
                          {categories &&
                            categories.map((category) => (
                              <Pressable
                                key={category.id}
                                style={({ pressed }) => [
                                  styles.categoryButton,
                                  {
                                    backgroundColor: pressed
                                      ? "lightgray"
                                      : "white",
                                  },
                                  {
                                    borderColor:
                                      selectedCategory === category.id
                                        ? "#B2361B"
                                        : "white",
                                  },
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                              >
                                <Text style={styles.categoryButtonText}>
                                  {category.name}
                                </Text>
                              </Pressable>
                            ))}
                        </View>
                      </ScrollView>
                    </View>
                    <View style={styles.spacer}></View>
                  </View>

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Todo Title:</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      onChangeText={setTodoTitle}
                      onFocus={onFocusHandler}
                      ref={inputRef}
                      value={todoTitle}
                      textAlign="left"
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>
                      Your Name / Asignee Name:
                    </Text>
                    <View style={styles.inputGroupContainer}>
                      <TextInput
                        style={styles.modalTextInputRow}
                        onChangeText={setYourName}
                        onFocus={onFocusHandler}
                        ref={inputRef}
                        value={yourName}
                        numberOfLines={1}
                        textAlign="left"
                        textAlignVertical="top"
                      />
                      <TextInput
                        style={styles.modalTextInputRow}
                        onChangeText={setAsigneeName}
                        onFocus={onFocusHandler}
                        ref={inputRef}
                        value={asigneeName}
                        numberOfLines={1}
                        textAlign="left"
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Task Description:</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      onChangeText={setTaskDescription}
                      onFocus={onFocusHandler}
                      ref={inputRef}
                      value={taskDescription}
                      numberOfLines={1}
                      textAlign="left"
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Asignee Email:</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      onChangeText={setAsigneeEmail}
                      onFocus={onFocusHandler}
                      ref={inputRef}
                      value={asigneeEmail}
                      numberOfLines={1}
                      textAlign="left"
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Pressable
                      style={[styles.button, styles.buttonCreate]}
                      onPress={createPassiveAssignmentHandler}
                    >
                      <Text style={styles.createButtonText}>Create</Text>
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
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
  },
  modalView: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.75,
    marginTop: Dimensions.get("window").height / 4,
    backgroundColor: "rgba(255, 87, 51, 0.95)",
    borderRadius: 20,
    padding: 16,
    paddingTop: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: "space-evenly",
  },
  buttonsContainer: {
    margin: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    borderRadius: 20,
    padding: 16,
    paddingHorizontal: 12,
    margin: 8,
    elevation: 2,
  },
  buttonCreate: {
    backgroundColor: "#B2361B",
    borderColor: primaryColor,
    width: "100%",
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  modalText: {
    flex: 3,
    textAlign: "center",
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalTextDescription: {
    flex: 2,
    fontSize: 8,
    color: "white",
    paddingTop: 8,
  },
  modalTextInput: {
    flex: 4,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 8,
    color: "white",
    height: 40,
    verticalAlign: "top",
    justifyContent: "flex-start",
  },
  modalTextInputRow: {
    flex: 4,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 10,
    color: "white",
    height: 40,
    justifyContent: "flex-start",
  },
  inputContiner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderContainer: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBodyContainer: {
    flex: 50,
    justifyContent: "flex-start",
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -38,
  },
  circleButtonContainer: {
    top: -20,
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeCirleButton: {
    left: Dimensions.get("window").width / 2 - 30,
    backgroundColor: "white",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeCircleText: {
    color: primaryColor,
    fontWeight: "bold",
    fontSize: 10,
    width: 13,
    textAlign: "center",
  },
  inputGroupContainer: {
    flex: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
  },
  categoryContainer: {
    padding: 0,
    flexDirection: "row",
    height: 50,
    width: "100%",
  },
  categoryButton: {
    flex: 1,
    margin: 4,
    backgroundColor: "white",
    padding: 12,
    paddingVertical: 0,
    borderRadius: 20,
    justifyContent: "center",
    borderWidth: 4,
  },
  categoryButtonText: {
    color: primaryColor,
    fontSize: 14,
    textAlign: "center",
  },
  categoryScrollView: {
    marginRight: 8,
  },
  spacer: {
    height: 100,
  },
  passAssignmentContainer: {
    flex: 1,
    flexDirection: "column",
    textAlign: "center",
    marginHorizontal: 16,
    marginTop: 16,
  },
});
