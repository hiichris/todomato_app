import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { TabButtons } from "./TabButtons";
import { primaryColor } from "../helpers/constants";
import { updateTodoNotes } from "../services/db_service";


const addUpdateTodoNotesHandler = (
    todoId,
    todoNotes,
    setTodoNotes,
    setUpdating,
    setUpdateCompleted
) => {
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


export function TodoDetails({
    goToPage,
    currentPage,
    todoTitle,
    params,
    todoNotes,
    setTodoNotes,
    todoId,
}) {
    const [updating, setUpdating] = useState(false);
    const [updateCompleted, setUpdateCompleted] = useState(false);
    const [image, setImage] = useState(null);

    return (
        <View style={styles.detailsContainer}>
            <TabButtons goToPage={goToPage} currentPage={currentPage} />
            <View style={styles.titleContainer}>
                <Text style={styles.TodoTitle}>{todoTitle}</Text>
            </View>

            <View style={styles.detailContentContainer}>
                <ScrollView>
                    <View style={styles.noteContainer}>
                        <Text style={styles.detailsSectionTitle}>🗒️ Note:</Text>
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

                    <View style={styles.spacer}></View>
                </ScrollView>
                <View style={styles.buttonsContainer}>
                    <Pressable style={styles.addMediaButton} onPress={() => {
                        addUpdateTodoNotesHandler(
                            todoId,
                            todoNotes,
                            setTodoNotes,
                            setUpdating,
                            setUpdateCompleted
                        );
                    }}>
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

                    <Pressable style={styles.addMediaButton} onPress={() => { }}>
                        <Text style={styles.addMediaButtonText}>Add Images</Text>
                    </Pressable>

                    <Pressable style={styles.addMediaButton} onPress={() => { }}>
                        <Text style={styles.addMediaButtonText}>Add GeoLocation</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    detailsContainer: {
        flex: 1,
        padding: 8,
    },
    titleContainer: {
        flex: 20,
    },
    detailContentContainer: {
        flex: 150,
        paddingHorizontal: 8,
        justifyContent: "center",
    },
    TodoTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        margin: 16,
    },
    noteContainer: {
        flex: 1,
        borderColor: "gray",
        paddingHorizontal: 10,
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
        height: 200,
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
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    detailsSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    pickerContainer: {
        flex: 30,
    },
    buttonTextContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    buttonTextStatus: {
        marginHorizontal: 4,
    },
});
