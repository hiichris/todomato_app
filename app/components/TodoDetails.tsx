import { View, Text, StyleSheet, ScrollView, Button, TextInput, Pressable } from "react-native";
import { TabButtons } from "./TabButtons";
import { primaryColor } from "../helpers/constants";

export function TodoDetails({ goToPage, currentPage, todoTitle }) {
    return (
        <View style={styles.detailsContainer}>
            <TabButtons goToPage={goToPage} currentPage={currentPage} />
            <View style={styles.titleContainer}>
                <Text style={styles.TodoTitle}>{todoTitle}</Text>
            </View>
            <View style={styles.detailContentContainer}>
                <ScrollView>
                    <View style={styles.noteContainer}>
                        <Text>🗒️ Additional Note:</Text>
                    </View>
                    <TextInput
                        multiline
                        placeholder="Add a note..."
                        style={styles.noteInput}
                    />

                    <View style={styles.spacer}></View>

                    <Pressable style={styles.addMediaButton} onPress={() => { }}>
                        <Text style={styles.addMediaButtonText}>Add Text Note</Text>
                    </Pressable>

                    <Pressable style={styles.addMediaButton} onPress={() => { }}>
                        <Text style={styles.addMediaButtonText}>Add Images</Text>
                    </Pressable>

                    <Pressable style={styles.addMediaButton} onPress={() => { }}>
                        <Text style={styles.addMediaButtonText}>Add GeoLocation</Text>
                    </Pressable>

                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    detailsContainer: {
        flex: 1,
        padding: 8,
    },
    titleContainer: {
        flex: 28,
    },
    detailContentContainer: {
        flex: 160,
        height: "100%",
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
        padding: 16,
        marginVertical: 4,
        backgroundColor: primaryColor
    },
    addMediaButtonText: {
        color: "white",
        fontSize: 16,
    },
    noteInput: {
        flex: 1,
        height: 100,
        borderColor: "lightgray",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        margin: 8,
    },
    spacer: {
        flex: 1,
        height: 32,
    }
});