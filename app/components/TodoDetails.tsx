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
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { TapButtons } from "./TapButtons";
import { primaryColor } from "../helpers/constants";
import { updateTodoNotes, addImage } from "../services/db_service";
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
}) {
  const [updating, setUpdating] = useState(false);
  const [updateCompleted, setUpdateCompleted] = useState(false);
  const [scrollToEnd, setScrollToEnd] = useState(false);
  const scrollViewRef = useRef();
  const scrollViewKeyboardRef = useRef();
  const [contentWidth, setContentWidth] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);

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
            // Scroll to the bottom of the ScrollView when the keyboard is shown
            setTimeout(() => {
              scrollViewKeyboardRef.current?.scrollToEnd({ animated: true });
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
      aspect: [16, 9],
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

  return (
    <View style={ styles.detailsContainer }>
      {/* Tap Buttons */}
      <TapButtons goToPage={goToPage} currentPage={currentPage} />

      <View style={styles.detailContentContainer}>
        {/* Todo Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.TodoTitle} ellipsizeMode="tail">
            {todoTitle}
          </Text>
        </View>

        {/* Todo Details */}
        <View style={styles.scrollViewContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.centeredView}
          >
            <ScrollView ref={scrollViewKeyboardRef}>
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
                  ></GeoLocations>

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
    fontSize: 32,
    fontWeight: "bold",
    margin: 16,
    height: 90,
    verticalAlign: "top",
  },
  sectionContainer: {
    flex: 1,
    borderColor: "gray",
    paddingBottom: 8,
    marginHorizontal: 12,
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
    height: 80,
    borderColor: "lightgray",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 8,
    textAlignVertical: "top",
    borderWidth: 1,
    backgroundColor: "white",
  },
  spacer: {
    flex: 1,
    height: 40,
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
    backgroundColor: primaryColor,
    padding: 16,
    borderRadius: 50,
    marginVertical: 8,
  },
  geolocLinkText: {
    color: "white",
    fontSize: 14,
  },
});
