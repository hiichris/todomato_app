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
import { SafeAreaView } from "react-native-safe-area-context";
import { primaryColor } from "../helpers/constants";
import { addNewTask } from "../services/db_service";

export default function AddTaskModal({
  modalVisible,
  todoId,
  setModalVisible,
  setTasks,
  refreshTasks,
  scheduleNotification,
}) {
  const [taskName, setTaskName] = React.useState("");
  const [duration, setDuration] = React.useState(5);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Scroll to the bottom of the ScrollView when the keyboard is shown
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

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
          <ScrollView style={styles.centeredView} ref={scrollViewRef} keyboardShouldPersistTaps="always">

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

              <View style={styles.modalView}>
                <View style={styles.modalHeaderContainer}>
                  <Text style={styles.headerText}>Create Task</Text>
                  <Pressable
                    style={styles.closeCirleButton}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text style={styles.closeCircleText}>X</Text>
                  </Pressable>
                </View>
                <View style={styles.modalBodyContainer}>
                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Task Name:</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      onChangeText={setTaskName}
                      value={taskName}
                    />
                    <Text>  </Text>
                  </View>
                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Duration(sec):</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      onChangeText={setDuration}
                      value={duration.toString()}
                    />

                    <Text>  </Text>
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Pressable
                      style={[styles.button, styles.buttonCreate]}
                      onPress={() => {
                        console.log("taskName: ", taskName, "Duration: ", duration, "todoID: ", todoId);

                        // Validate the input
                        if (taskName === "") {
                          Alert.alert("Task name cannot be empty!");
                          return;
                        }

                        if (duration < 1) {
                          Alert.alert("Duration must be greater than 0!");
                          return;
                        }

                        addNewTask(setTasks, todoId, taskName, parseInt(duration))
                          .then((result) => {
                            console.log("result: ", result);
                            refreshTasks();
                          })
                          .catch((error) => {
                            console.log("addNewTask Error: ", error);
                          }
                          );

                        // Clear the fields back to default
                        setTaskName("");
                        setDuration(5);

                        // Schedule notification
                        scheduleNotification(taskName, duration)
                          .then((result) => {
                            console.log("Notification scheduled!", result);
                          }
                          ).catch((error) => {
                            console.log("Error scheduling notification: ", error);
                          });

                        // Close the modal
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
