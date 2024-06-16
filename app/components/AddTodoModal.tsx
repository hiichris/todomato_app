import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {primaryColor} from "../helpers/constants";

export default function AddTodoModal({ modalVisible, setModalVisible }) {
  return (
    <SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            
            <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.button, styles.buttonCreate]}
              onPress={() => setModalVisible(!modalVisible)}
            >
                
              <Text style={styles.textStyle}>Create</Text>
            </Pressable>
           
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
                
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  modalView: {
    flex: 1,
    width: Dimensions.get("window").width,
    marginTop: Dimensions.get("window").height / 7,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 4,
    elevation: 2,
  },
  buttonCreate: {
    backgroundColor: primaryColor,
  },
  buttonClose: {
    backgroundColor: "#909090",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
});
