import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { primaryColor } from "../helpers/constants";

export const TodoSearchBar = ({ searchQuery, setSearchQuery }) => {
  // Update the search query
  const updateSearchHandler = (text) => {
    setSearchQuery(text);
  };

  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search a todo or a category"
        placeholderTextColor={"gray"}
        value={searchQuery}
        onChangeText={(text) => updateSearchHandler(text)}
      />
      {searchQuery.length > 0 && (
        <Pressable
          style={styles.clearButtonContainer}
          onPress={() => setSearchQuery("")}
        >
          <View>
            <Text style={styles.clearButtonText}>X</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
  },
  searchBar: {
    height: 40,
    borderColor: "lightgray",
    borderWidth: 1,
    borderRadius: 20,
    fontSize: 16,
    paddingHorizontal: 16,
    color: "black",
  },
  clearButtonContainer: {
    position: "absolute",
    right: 20,
    top: 17,
    width: 25,
    height: 25,
    backgroundColor: primaryColor,
    justifyContent: "center",
    borderRadius: 50,
  },
  clearButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 8,
    fontWeight: "bold",
  },
});
