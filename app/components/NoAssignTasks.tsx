import { View, Text, StyleSheet } from "react-native";
import { primaryColor } from "../helpers/constants";
import { Dimensions } from "react-native";
import { TaskPieChart } from "./TaskPieChart";

// NoAssigned Tasks Component 
export const NoAssignedTasks = ({ todoTitle, refreshTasks, has_completed }) => {
  return (
    <View style={styles.noAssignedTaskContainer}>
      <Text style={styles.noTextAssignText}>
        Currently, there are no assigned tasks for
      </Text>
      <Text
        style={[
          styles.noTextAssignTextTitle,
          has_completed == 1 ? styles.noTextAssignTextTitleCrossed : null,
        ]}
      >
        {todoTitle}
      </Text>
      <Text style={styles.noTextAssignDescText}>
        Add your first task (comes with a notification) is a great way to start!
      </Text>
      <View style={styles.notFoundImage}>
        <TaskPieChart asIcon={true} />
      </View>
      <View style={styles.spacer}></View>
      <Text style={styles.noTextAssignDescText}>
        🎯 Splitting your goal into smaller tasks helps you achieve it faster.
      </Text>
      <View style={styles.spacer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  noAssignedTaskContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  noTextAssignText: {
    color: primaryColor,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 20,
  },
  noTextAssignTextTitle: {
    fontSize: 24,
    padding: 10,
    width: "80%",
    textAlign: "center",
    color: primaryColor,
    fontWeight: "bold",
  },
  noTextAssignTextTitleCrossed: {
    textDecorationLine: "line-through",
  },
  noTextAssignDescText: {
    color: "gray",
    textAlign: "center",
    padding: 20,
  },
  notFoundImage: {
    flex: 1,
    width: Dimensions.get("window").width / 2,
    height: Dimensions.get("window").width / 2,
    marginBottom: 20,
  },
  spacer: {
    height: 20,
  },
});
