import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";

export const TextNote = ({
  todoId,
  todoNotes,
  setTodoNotes,
  styles,
  addUpdateTodoNotesHandler,
  updating,
  updateCompleted,
  setFocusedInput,
}) => {
  return (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.detailsSectionTitle}>Something to note</Text>
        <Pressable onPress={addUpdateTodoNotesHandler}>
          <View style={styles.noteUpdateButtonContainer}>
            <Text style={styles.noteUpdateText}>
              {updating ? "Updating" : "Update Note"}
            </Text>
            {updating ? (
              <ActivityIndicator
                color="gray"
                size={"small"}
                style={styles.buttonTextStatus}
              />
            ) : (
              <View style={styles.buttonTextStatus}></View>
            )}
            {updateCompleted ? (
              <Text style={styles.buttonTextStatus}>✅</Text>
            ) : (
              <></>
            )}
          </View>
        </Pressable>
      </View>
      <TextInput
        multiline
        placeholder="Tab here and start adding your note..."
        placeholderTextColor="gray"
        style={styles.noteInput}
        value={todoNotes}
        onFocus={() => {setFocusedInput}}
        onChangeText={(text) => {
          setTodoNotes(text);
        }}
      />

      <View style={styles.spacer}></View>
    </>
  );
};
