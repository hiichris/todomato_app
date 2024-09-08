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
import { addNewTask } from "../services/db_service";
import { ToDoDateTimePicker } from "./TodoDateTimePicker";
import { RadioButton } from "./RadioButton";
import moment from "moment";

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
  const durationInterval = [1, 5, 15, 20, 30, 60];
  const [selectedStartOption, setSelectedStartOption] = useState("now");
  const [selectedDate, setSelectedDate] = useState("");

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

  // Get the time difference in seconds
  const getTimeDifferenceInSeconds = (
    dateString: string,
    inputFormat: string = "MMM D YYYY, h:mm A"
  ) => {
    // If the date is empty, set it to today's date
    if (dateString === "" || dateString === null) {
      dateString = moment(new Date()).format(inputFormat);
    }
    // Convert the selected date with today's date and convert it in seconds
    const currentDate = new Date();
    const selectedDateObject = moment(dateString, inputFormat).toDate();
    const differenceInMilliseconds =
      new Date(selectedDateObject).getTime() - currentDate.getTime();
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

    return [differenceInSeconds, dateString];
  };

  // Add a new task
  const addNewTaskHandler = async () => {
    // Validate the input
    if (taskName === "") {
      Alert.alert("Task name cannot be empty!");
      return;
    }

    if (duration < 1) {
      Alert.alert("Duration must be greater than 0!");
      return;
    }
    // Get the difference in seconds from selected date
    const [differenceInSeconds, selectedDateString] =
      getTimeDifferenceInSeconds(selectedDate);
    console.log("differenceInSeconds: ", differenceInSeconds);

    // If the user selected "schedule" option, we will have to schedule the
    // notification based on the selected date and time. Then, schedule another
    // notification after the duration ends.
    if (selectedStartOption === "scheduled") {
      console.log("seelctedstartoption ", selectedStartOption);
      // Schedule the 1st reminder notification
      scheduleNotification(taskName, differenceInSeconds, "Reminder")
        .then((result) => {
          console.log(
            "Reminder notification scheduled in " +
              differenceInSeconds +
              " seconds!",
            result
          );
        })
        .catch((error) => {
          console.log("Error scheduling reminder notification: ", error);
        });
    }
    // Calculate the total duration in seconds for the alarm notification
    // If the difference is negative, it means there's no selected date and time.
    // We'll use the duration as the total duration for the alarm notification.
    var alaramDuration = 0;
    if (differenceInSeconds < 0) {
      alaramDuration = duration * 60;
    } else {
      alaramDuration = differenceInSeconds + duration * 60;
    }

    console.log("alaramDuration::: ", alaramDuration);

    // Schedule the alarm (2nd) notification
    scheduleNotification(taskName, alaramDuration, "Times up!")
      .then((result) => {
        console.log(
          "Alarm notification scheduled in " + alaramDuration + " seconds!",
          result
        );
        Alert.alert("Task scheduled successfully!🎉");
      })
      .catch((error) => {
        console.log("Error scheduling alram notification: ", error);
      });

    // Add the task to the database
    addNewTask(setTasks, todoId, taskName, duration, selectedDateString)
      .then((result) => {
        console.log("result: ", result);
        refreshTasks();
      })
      .catch((error) => {
        console.log("addNewTask Error: ", error);
      });

    // Clear the fields back to default
    setTaskName("");
    setDuration(5);

    // Close the modal
    setModalVisible(!modalVisible);
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
              <View
                style={[
                  styles.modalView,
                  {
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height / 2,
                    marginTop: Dimensions.get("window").height / 2,
                  },
                ]}
              >
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
                    <Text> </Text>
                  </View>

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Start From:</Text>
                    <View style={styles.inputGroupContainer}>
                      <RadioButton
                        selected={selectedStartOption === "now"}
                        onPress={() => setSelectedStartOption("now")}
                        label="Now"
                      />
                      <RadioButton
                        selected={selectedStartOption === "scheduled"}
                        onPress={() => setSelectedStartOption("scheduled")}
                        label="Scheduled"
                      />
                    </View>
                    <Text> </Text>
                  </View>

                  {selectedStartOption === "scheduled" && (
                    <View style={styles.inputContiner}>
                      <Text style={styles.modalText}>Notify On:</Text>
                      <ToDoDateTimePicker
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                      />
                    </View>
                  )}

                  <View style={styles.inputContiner}>
                    <Text style={styles.modalText}>Duration (min):</Text>
                    <View style={styles.inputGroupContainer}>
                      {durationInterval.map((number) => (
                        <Pressable
                          key={number}
                          style={({ pressed }) => [
                            styles.durationButton,
                            {
                              backgroundColor: pressed
                                ? "orange"
                                : duration === parseInt(number)
                                ? "#de2500"
                                : "white",
                            },
                          ]}
                          onPress={() => setDuration(parseInt(number))}
                        >
                          <Text
                            key={number}
                            style={[
                              styles.durationText,
                              {
                                color:
                                  duration === parseInt(number)
                                    ? "white"
                                    : primaryColor,
                              },
                            ]}
                          >
                            {number}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.button,
                        styles.buttonCreate,
                        {
                          backgroundColor: pressed ? "#9a2800" : "#B2361B",
                        },
                      ]}
                      onPress={addNewTaskHandler}
                    >
                      <Text style={styles.createButtonContainer}>Create</Text>
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
    borderColor: primaryColor,
    borderWidth: 1,
    width: "100%",
  },
  createButtonContainer: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
    padding: 8,
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
    fontSize: 14,
    width: Dimensions.get("window").width - 32,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 8,
    color: "white",
  },
  inputContiner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
  },
  inputGroupContainer: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "space-evenly",
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
  durationButton: {
    borderRadius: 50,
    width: 30,
    height: 30,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  durationText: {
    color: primaryColor,
    fontSize: 12,
    fontWeight: "bold",
  },
  instructionContainer: {
    fontSize: 10,
    textAlign: "center",
  },
  instructionText: {
    color: "white",
    marginTop: 8,
    textAlign: "center",
  },
});
