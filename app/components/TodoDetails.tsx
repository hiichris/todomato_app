import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { TapButtons } from "./TapButtons";
import { primaryColor } from "../helpers/constants";
import { updateTodoNotes, addImage, deleteTodo } from "../services/db_service";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ThumbnailImages } from "./ThumbnailImages";
import { TextNote } from "./TextNote";
import { GeoLocations } from "./GeoLocations";

// Get the device width
const { width: deviceWidth } = Dimensions.get("window");
const imageWidth = (deviceWidth - 18) / 1.5;

export function TodoDetails({
  goToPage,
  currentPage,
  todoTitle,
  params,
  todoNotes,
  setTodoNotes,
  todoId,
  images,
  setImages,
  refreshImages,
  navigation,
  has_completed,
}) {
  const [updating, setUpdating] = useState(false);
  const [updateCompleted, setUpdateCompleted] = useState(false);
  const [scrollToEnd, setScrollToEnd] = useState(false);
  const scrollViewRef = useRef();
  const [contentHeight, setContentHeight] = useState(0);
  const scrollViewKeyboardRef = useRef();
  const [contentWidth, setContentWidth] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);
  const [noteChanged, setNoteChanged] = useState(false);

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    setContentWidth(contentWidth);
  };

  useEffect(() => {
    if (scrollToEnd) {
      setTimeout(() => {
        const scrollPosition = contentWidth - imageWidth - imageWidth / 2 + 48;
        scrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
      setScrollToEnd(false);
    }

    if (focusedInput) {
      if (focusedInput === "map") {
        const keyboardDidShowListener = Keyboard.addListener(
          "keyboardDidShow",
          () => {
            // Scroll to half of the content height when the keyboard is shown for the map
            setTimeout(() => {
              scrollViewKeyboardRef.current?.scrollTo({
                y: contentHeight / 2,
                animated: true,
              });
            }, 100);
          }
        );
        return () => {
          setFocusedInput(null);
          keyboardDidShowListener.remove();
        };
      }
      if (focusedInput === "note") {
        const keyboardDidShowListener = Keyboard.addListener(
          "keyboardDidShow",
          () => {
            // Scroll to the bottom of the ScrollView when the keyboard is shown
            setTimeout(() => {
              scrollViewKeyboardRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
          }
        );
        return () => {
          setFocusedInput(null);
          keyboardDidShowListener.remove();
        };
      }
    }
  }, [scrollToEnd, focusedInput]);

  const addUpdateTodoNotesHandler = () => {
    // Set updating to true and stay for 2 seconds
    setUpdating(true);

    // Set note changed to false so the reminder disappears
    setNoteChanged(false);

    // Update the note
    updateTodoNotes(setTodoNotes, todoId, todoNotes)
      .then((result) => {
        setTimeout(() => {
          setUpdating(false);
          setUpdateCompleted(true);
        }, 800);

        setTimeout(() => {
          setUpdateCompleted(false);
        }, 2500);
      })
      .catch((error) => {
        console.log("Error: ", error);
        setTimeout(() => {
          setUpdating(false);
        }, 1000);
      });
  };

  const saveImage = async (uri: string) => {
    console.log("uri: ", uri);
    try {
      const fileName = uri.split("/").pop();
      const newPath = FileSystem.documentDirectory + fileName;

      if (newPath === null || newPath === undefined) {
        console.log("New path is null or undefined");
        return;
      }

      // Move the image to the file system
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      }).then((result) => {
        // Update the images list and state
        images.push({ image_url: newPath });
        console.log("images: ", images);
        setImages(images);
        setTimeout(() => {
          // Refresh the images
          refreshImages(todoId);
        }, 100);

        // Scroll to the end
        setScrollToEnd(true);
      });

      // Save the image to the database
      addImage(todoId, newPath)
        .then((result) => {
          console.log("Image saved to DB: ", result);
        })
        .catch((error) => {
          console.log("Error saving image to DB: ", error);
        });
    } catch (error) {
      console.log("Error saving image: ", error);
    }
  };

  const pickImageHandler = async () => {
    // Request permission to access the camera and media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera and media library is required!");
      return;
    }

    // Pick an image from the media library
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    // If the user cancels the image picker, return immediately
    if (pickerResult.canceled) {
      console.log("Image picker cancelled");
      return;
    }

    // Save the image to the file system
    saveImage(pickerResult.assets[0].uri);
  };

  const deleteTodoHandler = async () => {
    // Confirm if the user really wants to delete the todo
    Alert.alert(
      "🗑️ Delete Todo",
      "Are you sure you want to delete this todo?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            console.log("Deleting todo: ", todoId);
            console.log("navigation: ", navigation);
            // Update the note
            deleteTodo(todoId)
              .then((result) => {
                setTimeout(() => {
                  // Go back to the previous page
                  navigation.pop();
                }, 100);
              })
              .catch((error) => {
                console.log("Delete Todo Error: ", error);
              });
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const contentSizeChangeHandler = (contentWidth, contentHeight) => {
    setContentHeight(contentHeight);
  };
  console.log("eee has_completed: ", has_completed);
  return (
    <View style={styles.detailsContainer}>
      {/* Tap Buttons */}
      <TapButtons goToPage={goToPage} currentPage={currentPage} />

      <View style={styles.detailContentContainer}>
        {/* Todo Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.TodoTitle,
              has_completed == 1 ? styles.TotoTitleCrossed : {},
            ]}
            ellipsizeMode="tail"
            numberOfLines={2}
          >
            {todoTitle}
          </Text>
          <View
            style={[
              styles.categoryContainer,
              {
                backgroundColor: params.categoryColor,
              },
            ]}
          >
            <Text style={styles.categoryName}>{params.categoryName}</Text>
          </View>
        </View>

        {/* Todo Details */}
        <View style={styles.scrollViewContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.centeredView}
          >
            <ScrollView
              ref={scrollViewKeyboardRef}
              onContentSizeChange={contentSizeChangeHandler}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                  {/* Text Note */}
                  <TextNote
                    todoNotes={todoNotes}
                    setTodoNotes={setTodoNotes}
                    styles={styles}
                    addUpdateTodoNotesHandler={addUpdateTodoNotesHandler}
                    updating={updating}
                    updateCompleted={updateCompleted}
                    setFocusedInput={setFocusedInput}
                    noteChanged={noteChanged}
                    setNoteChanged={setNoteChanged}
                  />

                  {/* Images - Display only if there are images */}
                  <ThumbnailImages
                    images={images}
                    styles={styles}
                    scrollViewRef={scrollViewRef}
                    pickImageHandler={pickImageHandler}
                    handleContentSizeChange={handleContentSizeChange}
                  />

                  {/* GeoLocation - Display only if there are geolocations */}
                  <GeoLocations
                    styles={styles}
                    setFocusedInput={setFocusedInput}
                    todoId={todoId}
                  ></GeoLocations>

                  <View style={styles.deleteButtonContainer}>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={deleteTodoHandler}
                    >
                      <Text style={styles.deleteButtonText}>Delete Todo</Text>
                    </Pressable>
                  </View>

                  <View style={styles.spacer}></View>
                </>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 5,
    padding: 8,
  },
  titleContainer: {},
  detailContentContainer: {
    flex: 200,
    paddingHorizontal: 0,
    verticalAlign: "top",
    justifyContent: "center",
  },
  scrollViewContainer: {
    flex: 80,
  },
  TodoTitle: {
    fontSize: 30,
    fontWeight: "bold",
    margin: 8,
    marginHorizontal: 10,
    height: 80,
    verticalAlign: "top",
  },
  TotoTitleCrossed: {
    textDecorationLine: "line-through",
  },
  sectionContainer: {
    flex: 1,
    borderColor: "gray",
    paddingBottom: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderBottomColor: "lightgray",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  addMediaButton: {
    flex: 1,
    borderColor: "gray",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    backgroundColor: primaryColor,
  },
  addMediaButtonText: {
    color: "white",
    fontSize: 16,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    height: 90,
    borderColor: "lightgray",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 8,
    textAlignVertical: "top",
    backgroundColor: "white",
    borderWidth: 1,
  },
  spacer: {
    flex: 1,
    height: 50,
  },
  buttonsContainer: {
    flex: 40,
    flexDirection: "column",
    justifyContent: "space-around",
    marginBottom: 16,
    marginTop: 8,
  },
  detailsSectionTitle: {
    flex: 5,
    fontSize: 24,
    fontWeight: "bold",
  },
  pickerContainer: {
    flex: 1,
  },
  buttonTextContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonTextStatus: {},
  imagesContainer: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 8,
  },
  image: {
    flex: 1,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    margin: 4,
  },
  noteUpdateButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: primaryColor,
    borderRadius: 50,
  },
  noteUpdateText: {
    color: primaryColor,
    fontSize: 14,
    marginHorizontal: 8,
  },
  noteReminder: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "gray",
    marginVertical: 8,
  },
  geolocContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  geolocMap: {
    height: 250,
    borderRadius: 20,
  },
  placeholderImage: {
    flex: 1,
    width: imageWidth,
    height: imageWidth,
    borderRadius: 20,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderColor: primaryColor,
    borderWidth: 1,
  },
  geolocInput: {
    flex: 1,
    borderColor: "lightgray",
    borderWidth: 1,
    padding: 10,
    margin: 0,
    borderRadius: 10,
    backgroundColor: "white",
  },
  addImageText: {
    color: primaryColor,
  },
  geolocSerachContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  geolocButtonText: {
    color: primaryColor,
    fontSize: 14,
    padding: 8,
  },
  centeredView: {
    flex: 1,
  },
  geolocLinkContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: primaryColor,
    borderWidth: 1,
    padding: 16,
    borderRadius: 50,
    marginVertical: 8,
    marginTop: 0,
    marginBottom: 20,
  },
  geolocLinkText: {
    color: primaryColor,
    fontSize: 14,
  },
  savedGeolocationContainer: {
    flex: 1,
    flexDirection: "row",
  },
  savedGeoLocationText: {
    color: "gray",
    fontSize: 14,
    padding: 2,
  },
  deleteButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "red",
    borderRadius: 50,
    padding: 16,
    marginVertical: 8,
    textAlign: "center",
  },
  deleteButtonText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  categoryContainer: {
    justifyContent: "center",
    alignContent: "center",
    width: 100,
    backgroundColor: "gray",
    borderRadius: 50,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  categoryName: {
    color: "white",
    textAlign: "center",
  },
});
