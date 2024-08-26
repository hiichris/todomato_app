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
} from "react-native";
import React, { useState } from "react";
import { TabButtons } from "./TabButtons";
import { primaryColor } from "../helpers/constants";
import { updateTodoNotes, addImage } from "../services/db_service";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Get the device width
const { width: deviceWidth } = Dimensions.get("window");

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
}) {
    const [updating, setUpdating] = useState(false);
    const [updateCompleted, setUpdateCompleted] = useState(false);

    if (images !== null && images !== undefined) {
        images.map((image) => {
            console.log("Image: ", image.image_url);
        });
    }

    const addUpdateTodoNotesHandler = () => {
        // Set updating to true and stay for 2 seconds
        setUpdating(true);

        // Update the note
        updateTodoNotes(setTodoNotes, todoId, todoNotes)
            .then((result) => {
                console.log("Updated note: ", result);
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
            console.log("fileName: ", fileName);
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
                console.log("Image saved: ", newPath);
                images.push({ image_url: newPath });
            });

            // Save the image to the database
            addImage(todoId, newPath)
                .then((result) => {
                    console.log("Image saved to DB: ", result);
                }
                ).catch((error) => {
                    console.log("Error saving image to DB: ", error);
                });



        } catch (error) {
            console.log("Error saving image: ", error);
        }
    };

    const pickImageHandler = async () => {
        // Request permission to access the camera and media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission to access camera and media library is required!");
            return;
        }

        // Pick an image from the media library
        const pickerResult = await ImagePicker.launchImageLibraryAsync(
            {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
            }
        );

        // If the user cancels the image picker, return immediately
        if (pickerResult.canceled) {
            console.log("Image picker cancelled");
            return;
        }

        // Save the image to the file system
        saveImage(pickerResult.assets[0].uri);
    };

    return (
        <View style={styles.detailsContainer}>
            {/* Tab Buttons */}
            <TabButtons goToPage={goToPage} currentPage={currentPage} />

            <View style={styles.detailContentContainer}>
                {/* Todo Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.TodoTitle}>{todoTitle}</Text>
                </View>

                {/* Todo Details */}
                <View style={styles.scrollViewContainer}>

                    <ScrollView>
                        {/* Text Note */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.detailsSectionTitle}>🗒️ Something to note</Text>
                        </View>
                        <TextInput
                            multiline
                            placeholder="Tab here and start adding your note..."
                            style={styles.noteInput}
                            value={todoNotes}
                            onChangeText={(text) => {
                                setTodoNotes(text);
                            }}
                        />

                        <View style={styles.sectionContainer}>
                            <Text style={styles.detailsSectionTitle}>🏞️ Something to visualise</Text>
                        </View>

                        {/* Image */}
                        <ScrollView horizontal={true}>
                        <View style={styles.imagesContainer}>
                            {/* Loop through the images if there are any */}
                            {images && images.length > 0 && (
                                images.map((image) => {
                                    return (
                                        <Image
                                            source={{ uri: image.image_url }}
                                            style={styles.image}
                                        />
                                    );
                                })

                            )}

                        </View>
                        </ScrollView>

                        <View style={styles.spacer}></View>
                    </ScrollView>


                </View>
            </View>
            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <Pressable style={styles.addMediaButton} onPress={addUpdateTodoNotesHandler}>
                    <View style={styles.buttonTextContainer}>
                        <Text style={styles.addMediaButtonText}>
                            {todoNotes ? "Update Text Note" : "Add Text Note"}
                        </Text>
                        {updating ? (
                            <ActivityIndicator
                                color="white"
                                style={styles.buttonTextStatus}
                            />
                        ) : (
                            <></>
                        )}
                        {updateCompleted ? (
                            <Text style={styles.buttonTextStatus}>✅</Text>
                        ) : (
                            <></>
                        )}
                    </View>
                </Pressable>

                <Pressable style={styles.addMediaButton} onPress={pickImageHandler}>
                    <Text style={styles.addMediaButtonText}>Add Images</Text>
                </Pressable>

                <Pressable style={styles.addMediaButton} onPress={() => { }}>
                    <Text style={styles.addMediaButtonText}>Add GeoLocation</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    detailsContainer: {
        flex: 5,
        padding: 8,
    },
    titleContainer: {
        flex: 10,
    },
    detailContentContainer: {
        flex: 180,
        paddingHorizontal: 8,
        justifyContent: "center",
    },
    scrollViewContainer: {
        flex: 50,
    },
    TodoTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        margin: 16,
    },
    sectionContainer: {
        flex: 1,
        borderColor: "gray",
        paddingBottom: 8,
        marginHorizontal: 12,
        borderBottomColor: "lightgray",
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
        height: 120,
        borderColor: "lightgray",
        borderRadius: 10,
        padding: 10,
        margin: 8,
        textAlignVertical: "top",
    },
    spacer: {
        flex: 1,
        height: 82,
    },
    buttonsContainer: {
        flex: 50,
        flexDirection: "column",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    detailsSectionTitle: {
        fontSize: 18,
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
    buttonTextStatus: {
        marginHorizontal: 4,
    },
    imagesContainer: {
        flex: 1,
        flexDirection: "row",
    },
    image: {
        flex: 1,
        width: (deviceWidth - 18) / 1.8,
        height: (deviceWidth - 18) / 1.8,
        borderRadius: 20,
        margin: 8,
    }
});
