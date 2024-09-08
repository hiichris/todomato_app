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
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../helpers/constants";
import { addNewTodo, getCategories, getTodoById } from "../services/db_service";

// Add Todo Modal Component
export default function AddTodoModal({
  modalVisible,
  setModalVisible,
  setTodos,
  refreshTodos,
  router,
  categories,
  setCategories,
  isPassiveAssignment,
}) {
  const [todoTitle, setTodoTitle] = React.useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Add a listener to the keyboard
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Scroll to the bottom of the ScrollView when the keyboard is shown
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    // Retrieve latest categories from the database when the modal is visible
    retrieveDBCategories();
  }, [modalVisible]);

  // Create a new todo
  const createTodoHandler = async () => {
    let lastCreatedTodoId = null;
    // Sanity check
    if (todoTitle === "") {
      Alert.alert("Todo Title is required");
      return;
    }
    if (selectedCategory === null) {
      Alert.alert("Please select a category");
      return;
    }

    console.log(
      "Todo Title: ",
      todoTitle,
      "selectedCategory: ",
      selectedCategory
    );
    // Add the new todo to the database
    addNewTodo(setTodos, todoTitle, selectedCategory)
      .then((result) => {
        console.log("result: ", result);
        lastCreatedTodoId = result.lastInsertRowId;
        refreshTodos();

        // Clear the todoTitle and selectedCategory
        setTodoTitle("");
        setSelectedCategory(null);
        setModalVisible(!modalVisible);

        // Get the last created todo details and navigate to the details screen
        getTodoById(lastCreatedTodoId)
          .then((todo) => {
            router.push({
              pathname: "/todo_details",
              params: {
                passiveTask: isPassiveAssignment,
                title: todo?.title,
                id: todo?.id,
                categoryName: todo?.category_name,
                categoryColor: todo?.category_color,
                refreshTodos: refreshTodos,
              },
            });
          })
          .catch((error) => {
            console.log("Error: ", error);
          });
      })
      .catch((error) => {
        console.log("Error: ", error);
      });

    // Clear the todoTitle
    setTodoTitle("");
    setSelectedCategory(null);
    setModalVisible(!modalVisible);
  };

  // Retrieve categories from the database
  const retrieveDBCategories = async () => {
    const dbCategories = await getCategories(false)
      .then((result) => {
        setCategories(result);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  };

  // Handle the onFocus event
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
                      value={todoTitle}
                      returnKeyType="create"
                      numberOfLines={2}
                      multiline={true}
                      textAlign="left"
                      textAlignVertical="top"
                      onSubmitEditing={createTodoHandler}
                    />
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.button,
                        styles.buttonCreate,
                        { backgroundColor: pressed ? "#9a2800" : "#B2361B" },
                      ]}
                      onPress={createTodoHandler}
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
    height: 60,
    verticalAlign: "top",
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
    flex: 4,
    flexDirection: "row",
    justifyContent: "space-evenly",
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
});
