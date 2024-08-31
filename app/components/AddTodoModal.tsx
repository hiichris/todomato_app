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
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../helpers/constants";
import { addNewTodo, getCategories } from "../services/db_service";
import { SQLiteProvider } from "expo-sqlite";
import { Todo } from "../models/todo";

export default function AddTodoModal({
  modalVisible,
  setModalVisible,
  setTodos,
  refreshTodos,
  router,
}) {
  const [todoTitle, setTodoTitle] = React.useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Scroll to the bottom of the ScrollView when the keyboard is shown
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );
    retrieveDBCategories();

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const createTodoHandler = async () => {
    if (todoTitle === "") {
      Alert.alert("Todo Title is required");
      return;
    }
    if (selectedCategory === null) {
      Alert.alert("Please select a category");
      return;
    }

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
  };

  const retrieveDBCategories = async () => {
    console.log("Retrieving categories");
    const dbCategories = await getCategories();
    console.log("dbCategories: ", dbCategories);
    setCategories(dbCategories);
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
                      returnKeyType="create"
                      onSubmitEditing={createTodoHandler}
                    />
                  </View>

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Category:</Text>
                    <View style={styles.inputGroupContainer}>
                      <ScrollView
                        style={styles.categoryScrollView}
                        horizontal={true}
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
                                      : selectedCategory === category.id
                                      ? "#ffc8a0"
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
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Pressable
                      style={[styles.button, styles.buttonCreate]}
                      onPress={() => {
                        console.log("todoTitle: ", todoTitle);

                        createTodoHandler();
                      }}
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
    justifyContent: "space-evenly",
  },
  buttonsContainer: {
    margin: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
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
    fontSize: 16,
  },
  modalText: {
    flex: 2,
    textAlign: "center",
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
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
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBodyContainer: {
    flex: 50,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 18,
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
  inputGroupContainer: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  categoryContainer: {
    flex: 4,
    padding: 0,
    borderRadius: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    margin: 4,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignContent: "center",
  },
  categoryButtonText: {
    color: primaryColor,
    fontSize: 14,
    textAlign: "center",
  },
  categoryScrollView: {
    marginRight: 8,
  },
});
