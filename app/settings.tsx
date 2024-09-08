import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, Stack, useRouter } from "expo-router";
import { primaryColor, colorArray } from "./helpers/constants";
import {
  getCategories,
  resetDatabase,
  deleteCategory,
  addCategory,
} from "./services/db_service";

// Settings Screen Component
export default function SettingsScreen() {
  const [categories, setCategories] = useState(null);
  const [addNewCategoryName, setAddNewCategoryName] = useState("");
  const [addNewCategoryColor, setAddNewCategoryColor] = useState("");
  const router = useRouter();

  // Refresh categories on load
  useEffect(() => {
    refreshCategories();
  }, []);

  // Retrieve categories from database and set to the categories state
  const refreshCategories = async () => {
    console.log("Refreshing categories");
    const dbCategories = await getCategories();
    setCategories(dbCategories);
  };

  // Reset database
  const resetDatabaseHandler = async () => {
    // Show alert to confirm reset process
    Alert.alert(
      "Reset Database",
      "Are you sure you want to reset the database?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            await resetDatabase();
            console.log("Database has been reset!");
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  // Delete category handler
  const deleteCategoryHandler = async (categoryId) => {
    console.log("Deleting category: ", categoryId);
    await deleteCategory(categoryId);
    await refreshCategories();
  };

  // Add new category handler
  const addNewCategoryHandler = async () => {
    // Check if category name and color are provided
    if (addNewCategoryName && addNewCategoryColor) {
      console.log(
        "Adding new category: ",
        addNewCategoryName,
        addNewCategoryColor
      );
      await addCategory(addNewCategoryColor, addNewCategoryName, 0);
      setAddNewCategoryName("");
      setAddNewCategoryColor("");
      await refreshCategories();
      Alert.alert("🎉Success", "New category has been added!");
    } else {
      // Show alert if category name and color are not provided
      Alert.alert(
        "Warning",
        "Please enter a category name and select a color."
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      ></Stack.Screen>
      <ScrollView>
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <Text style={styles.listHeaderDescription}></Text>

          {/* App Info */}
          <View style={styles.blockTopContainer}>
            <Text style={styles.blockTitle}>App Information</Text>
          </View>
          <View style={styles.blockContainer}>
            <Text>Name</Text>
            <Text>Todomato</Text>
          </View>
          <View style={styles.blockBottomContainer}>
            <Text>Version</Text>
            <Text>1.0</Text>
          </View>

          {/* Category Settings */}
          <View style={styles.blockTopContainer}>
            <Text style={styles.blockTitle}>Todo Category</Text>
          </View>
          <View style={styles.blockContainer}>
            <Text style={styles.blockTopic}>Categories</Text>
            <View style={styles.blockRightContainer}>
              <Text style={styles.descriptionText}>
                To remove a category, tap the X button next to the cateogry.
              </Text>
              <View style={styles.categoryContainer}>
                {categories &&
                  categories.map((category, index) => {
                    return (
                      <View
                        key={index}
                        style={[
                          styles.categoryButton,
                          { backgroundColor: category.color },
                        ]}
                      >
                        <Text style={styles.categoryButtonText}>
                          {category.name}
                        </Text>
                        <Pressable
                          style={({ pressed }) => [
                            styles.categoryDeleteButton,
                            {
                              backgroundColor: pressed ? "lightgray" : "white",
                            },
                          ]}
                          onPress={() => deleteCategoryHandler(category.id)}
                        >
                          <Text style={styles.categoryDeleteButtonText}>X</Text>
                        </Pressable>
                      </View>
                    );
                  })}
              </View>
            </View>
          </View>
          <View style={styles.blockBottomContainer}>
            <Text style={styles.blockTopic}>Add new</Text>
            <View style={styles.blockRightContainer}>
              <Text style={styles.descriptionText}>
                To add a new category, enter the category name and select a
                color.
              </Text>
              <View style={styles.addNewCategoryContainer}>
                <TextInput
                  placeholder="Category name"
                  style={styles.addNewCategoryInput}
                  value={addNewCategoryName}
                  onChangeText={(text) => setAddNewCategoryName(text)}
                />
              </View>
              <View style={styles.addNewColorContainer}>
                {colorArray.map((color, index) => {
                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.addNewColorButton,
                        { backgroundColor: color },
                        {
                          borderColor:
                            addNewCategoryColor === color ? "black" : "white",
                        },
                      ]}
                      onPress={() => setAddNewCategoryColor(color)}
                    >
                      <Text style={styles.categoryButtonText}> </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={styles.addNewButtonContainer}
                onPress={addNewCategoryHandler}
              >
                <View style={styles.addNewButton}>
                  <Text style={styles.addNewColorButtonText}>Add</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Reset database version */}
          <View style={styles.blockTopContainer}>
            <Text style={styles.blockTitle}>Database</Text>
          </View>
          <View style={styles.blockBottomContainer}>
            <Text style={styles.blockTopic}>Reset Database</Text>
            <View style={styles.blockRightContainer}>
              <Text style={styles.descriptionText}>
                Reset the database to its initial state (with dummy data
                included.)
              </Text>
              <Pressable onPress={resetDatabaseHandler}>
                <View style={styles.resetButtonContainer}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    margin: 16,
  },
  settingsTitle: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 16,
  },
  listHeaderDescription: {
    fontSize: 16,
    color: "gray",
  },
  blockTopContainer: {
    backgroundColor: "#e7e7e7",
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  blockContainer: {
    backgroundColor: "#e7e7e7",
    padding: 18,
    marginBottom: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  blockBottomContainer: {
    backgroundColor: "#e7e7e7",
    padding: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    backgroundColor: "#FF5733",
    borderRadius: 20,
    margin: 4,
    padding: 8,
    paddingHorizontal: 16,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryButtonText: {
    fontSize: 12,
    textAlign: "center",
    color: "white",
  },
  blockRightContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  categoryDeleteButton: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  categoryDeleteButtonText: {
    fontSize: 10,
    color: "gray",
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 8,
  },
  blockTopic: {
    width: 80,
  },
  resetButtonContainer: {
    padding: 8,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  resetButtonText: {
    color: primaryColor,
    fontSize: 14,
  },
  addNewCategoryContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    padding: 8,
    borderColor: "gray",
  },
  addNewCategoryInput: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
  addNewColorContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    textAlign: "center",
    justifyContent: "center",
    margin: 10,
  },
  addNewColorButton: {
    backgroundColor: "#FF5733",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingRight: 8,
    width: 32,
    height: 32,
    margin: 4,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 4,
  },
  addNewButtonContainer: {
    flex: 1,
  },
  addNewButton: {
    padding: 8,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    backgroundColor: primaryColor,
  },
  addNewColorButtonText: {
    color: "white",
    fontSize: 14,
  },
});
