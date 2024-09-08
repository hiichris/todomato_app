import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

// Radio Button Component
export const RadioButton = ({ selected, onPress, label }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.radioButtonContainer}>
      <View
        style={[
          styles.radioButton,
          { borderColor: selected ? "white" : "white" },
        ]}
      >
        {selected ? <View style={styles.radioButtonInner} /> : null}
      </View>
      <Text style={styles.labelText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    height: 30,
    width: 30,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "yellow",
  },
  labelText: {
    color: "white",
  },
});
