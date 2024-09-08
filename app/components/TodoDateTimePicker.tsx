import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

// Date Time Picker Component
export const ToDoDateTimePicker = ({ selectedDate, setSelectedDate }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // Show date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  // Hide date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  // Handle date confirmation
  const handleConfirm = (date) => {
    const formattedDate = moment(date).format("MMM D YYYY, h:mm A");
    const currentDate = new Date();
    // Check if date is in the past
    if (date < currentDate) {
      Alert.alert("Invalid Date", "Please select a future date/time.");
      return;
    }
    console.log("formattedDate: ", formattedDate);
    // Set milliseconds to 0 to avoid timezone issues
    date.setMilliseconds(0);
    setSelectedDate(formattedDate);

    // Finally, hide the date picker
    hideDatePicker();
    console.log("A date has been picked: ", date.toString());
  };

  return (
    <View style={styles.dateTimePickerContainer}>
      <Pressable style={styles.pickerButton} onPress={showDatePicker}>
        <Text style={styles.pickerText}>📅 Picker</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={new Date()}
        pickerStyleIOS={{ backgroundColor: "white" }}
        textColor="black"
        isDarkModeEnabled={false} // Changes text color in iOS spinner mode
      />
      <Text style={styles.dateText}>{selectedDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dateTimePickerContainer: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 8,
    color: "white",
    padding: 4,
  },
  pickerButton: {
    borderRadius: 10,
    padding: 8,
    margin: 0,
  },
  pickerText: {
    color: "white",
    fontWeight: "bold",
  },
  dateText: {
    flex: 2,
    fontSize: 12,
    color: "white",
    paddingHorizontal: 16,
    textAlign: "center",
  },
});
