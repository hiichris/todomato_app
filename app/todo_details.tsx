import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";
import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import { useEffect, useState, useRef } from "react";
import StackScreen from "./components/StackScreen";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded, addNewTask, getAllTasks } from "./services/db_service";
import { PickerIOS } from "@react-native-picker/picker";
import { Task } from "./models/task";
import { TaskItems } from "./components/TaskItems";
import * as Notifications from "expo-notifications";

export default function TodoDetails() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const params = useLocalSearchParams();
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [taskName, setTaskName] = useState();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Request permissions
    async function getPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    }

    getPermissions();

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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Todomado Reminders",
        body: taskName,
      },
      trigger: {
        seconds: duration,
      },
    });
  };

  return (
    <SQLiteProvider databaseName="todos.db" onInit={migrateDbIfNeeded}>
      <Stack.Screen
        options={{
          title: "",
        }}
      ></Stack.Screen>
      <View style={styles.container}>
        <StackScreen
          title={params.title.substring(0, 10)}
          todos={params.todos}
          setTodos={params.setTodos}
          addTodoButton={false}
        />

        <Text style={styles.TodoTitle}>{params.title}</Text>

        <TaskItems todo_id={params.id} tasks={tasks} setTasks={setTasks} />

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
            addNewTask(null, parseInt(params.id), taskName, selectedTimer).then(
              (result) => {
                console.log("Result: ", result);
              }
            ).catch((error) => {
              console.log("Error: ", error);
            });

            getAllTasks(null, parseInt(params.id)).then((tasks) => {
              console.log("Tasks: ", tasks);
              setTasks(tasks);
            }).catch((error) => {
              console.log("Error: ", error);
            });

            scheduleNotification(taskName, parseInt(selectedTimer));

          }}
        />
        <View style={styles.SpaceContainer}></View>
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  TodoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
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
});
