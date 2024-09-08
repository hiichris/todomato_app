import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { getCategories } from "../services/db_service";
import { useState, useEffect } from "react";

// Fav Categories Component
export const FavCategories = ({ setSearchQuery }) => {
  const [categories, setCategories] = useState([]);

  // Retrieve categories from the database
  const retrieveDBCategories = async () => {
    const dbCategories = await getCategories(true);
    setCategories(dbCategories);
  };

  // Get the screen width
  const screenWidth = Dimensions.get("window").width; // Get the screen width

  useEffect(() => {
    retrieveDBCategories();
  }, []);

  return (
    <View style={styles.favCategoryContainer}>
      <Text style={styles.favCategoryText}>Fav Categories</Text>

      <ScrollView
        style={styles.favButtonsContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {categories &&
          categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.favButton,
                {
                  backgroundColor: category.color,
                },
              ]}
              onPress={() => {
                console.log("Category pressed: ", category.id);
                setSearchQuery(category.name);
              }}
            >
              <Text style={styles.favButtonText}>{category.name}</Text>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  favCategoryContainer: {
    flex: 1,
    marginHorizontal: 18,
  },
  favCategoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginVertical: 8,
  },
  favButtonsContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 0,
    margin: 0,
  },
  favButton: {
    borderRadius: 50,
    margin: 2,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  favButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
