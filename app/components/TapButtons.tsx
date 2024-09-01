import { View, Text, Pressable, StyleSheet } from "react-native";
import { primaryColor } from "../helpers/constants";

export const TapButtons = ({ goToPage, currentPage }) => {
  return (
    <View style={styles.tabViewButtonsContainer}>
      <Pressable onPress={() => goToPage(0)}>
        <Text
          style={
            currentPage == 1
              ? styles.tabViewInactiveButton
              : styles.tabViewButton
          }
        >
          Tasks
        </Text>
      </Pressable>
      <Pressable onPress={() => goToPage(1)}>
        <Text
          style={
            currentPage == 0
              ? styles.tabViewInactiveButton
              : styles.tabViewButton
          }
        >
          Details
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  tabViewButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  tabViewButton: {
    fontSize: 16,
    borderWidth: 1,
    borderBottomColor: primaryColor,
    color: primaryColor,
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderColor: primaryColor,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  tabViewInactiveButton: {
    fontSize: 16,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderColor: "gray",
    borderRadius: 10,
    marginHorizontal: 2,
    color: "gray",
  },
});
