import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";
import { View, Text, StyleSheet, Button, TextInput, FlatList, ScrollView, AppRegistry, Image, Dimensions } from "react-native";
import { useEffect, useState, useRef } from "react";
import StackScreen from "./components/StackScreen";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import { getAllTasks, addNewTask, deleteTodo } from "./services/db_service";
import { PickerIOS } from "@react-native-picker/picker";
import { Task } from "./models/task";
import { TaskItems } from "./components/TaskItems";
import * as Notifications from "expo-notifications";
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { primaryColor } from "./helpers/constants";


/* 
  Image Reference and Credits:
  not_found.png - https://freesvgillustration.com/product/404-not-found/

*/

function NoAssignedTasks({ todoTitle }) {
  return (
    <View style={styles.noAssignedTaskContainer}>
      <Text style={styles.noTextAssignText}>
        Currently, there are no assigned tasks for
      </Text>
      <Text style={styles.noTextAssignText}>
        "{todoTitle}"
      </Text>
      <Text style={styles.noTextAssignDescText}>
        Press the Add Task button to add a new task.
      </Text>
      <Image style={styles.notFoundImage} source={require('../assets/images/not_found.png')} />
    </View>
  )
}

export default function TodoDetailsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const params = useLocalSearchParams();
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [taskName, setTaskName] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    // Request permissions
    async function getPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    }


    getPermissions();
    refreshTasks();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listener for foreground notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listener for response to notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const scheduleNotification = async (taskName: string, duration: number) => {
    console.log("Scheduling notification...", taskName, duration);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Todomado",
        body: "Times Up: " + taskName,
      },
      trigger: {
        seconds: parseInt(duration),
      },
    });
  };

  const refreshTasks = async () => {
    console.log("refreshTasks...");
    await getAllTasks(setTasks, parseInt(params.id));
  }


  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
        }}
      ></Stack.Screen>
      <StackScreen
        title={params.title.substring(0, 10)}
        todoId={params.id}
        setTodos={params.setTodos}
        addTaskButton={true}
        refreshTodos={params.refreshTodos}
        refreshTasks={refreshTasks}
        scheduleNotification={scheduleNotification}
      />
      {tasks.length > 0 ?
        <View style={styles.TaskItemContainer}>
          <TaskItems tasks={tasks} todoTitle={params.title} refreshTasks={refreshTasks} />
        </View>
        : <NoAssignedTasks todoTitle={params.title} />

      }

      {/* 
        <Text>Task name: </Text>
        <TextInput
          style={styles.textInput}
          value={taskName}
          onChangeText={(text) => {
            setTaskName(text);
          }}
        />

        <Text>Set reminder in: </Text>
        <TextInput style={styles.reminderInput} value="5" />
        <Text>seconds</Text>
        <Button
          title="Add New Task"
          onPress={() => {
            console.log("Task Name: ", taskName);
            console.log("Reminder: ", selectedTimer);
            console.log("Todo ID: ", params.id);
            console.log("Add New Task");

            // addNewTask(setTasks, parseInt(params.id), taskName, selectedTimer).then(
            //   (result) => {
            //     console.log("Result: ", result);
            //     console.log("addnewtask, Refreshing tasks...");
            //     refreshTasks();
            //     console.log("Scheduling notification...2", taskName, selectedTimer);
            //      scheduleNotification(taskName, parseInt(selectedTimer));
            //   }
            // ).catch((error) => {
            //   console.log("Error: ", error);
            // });
            

          }}
        />

        <Button
          title={`Delete Task: ${params.id}`}
          onPress={async () => {
            await deleteTodo(params.setTodos, parseInt(params.id)).then((result) => {
              console.log("Result: ", result);
            })
              .then(() => {
                navigation.navigate("index");
              }
              ).catch((error) => {
                console.log("Error: ", error);
              });

          }}
        /> */}
      <View style={styles.SpaceContainer}></View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,

  },
  TodoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 8,
    marginVertical: 16,
  },
  SpaceContainer: {
    flex: 1,
  },
  textInput: {
    height: 40,
    width: 200,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  reminderInput: {
    height: 40,
    width: 50,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    textAlign: "center",
  },
  TaskItemContainer: {
    height: "100%",
  },
  noAssignedTaskContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  noTextAssignText: {
    color: primaryColor,
    textAlign: "center",
    fontWeight: "bold",
  },
  noTextAssignDescText: {
    color: "gray",
    textAlign: "center",
    paddingVertical: 16, 
  },
  notFoundImage: {
    width: Dimensions.get("window").width / 2,
    height: Dimensions.get("window").width / 2,
    alignSelf: "center",
  },

});
