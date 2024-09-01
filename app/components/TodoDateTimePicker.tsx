import React, { useState } from "react";
import {
  View,
  Button,
  Platform,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
  Pressable,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import { primaryColor } from "../helpers/constants";

export const ToDoDateTimePicker = ({selectedDate, setSelectedDate}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedDate = moment(date).format('MMM D YYYY, h:mm A');
    const currentDate = new Date();

    if (date < currentDate) {
      Alert.alert("Invalid Date", "Please select a future date/time.");
      return;
    }
    console.log("formattedDate: ", formattedDate);
    // Set milliseconds to 0
    date.setMilliseconds(0);
    setSelectedDate(formattedDate);

    hideDatePicker();
    console.log("A date has been picked: ", date.toString());
  };

  return (
    <View style={styles.dateTimePickerContainer}>
      <Pressable
        style={styles.pickerButton}
        onPress={showDatePicker}
      >
      <Text style={styles.pickerText}>📅 Picker</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={new Date()}
        pickerStyleIOS={{backgroundColor: "white"}}
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
