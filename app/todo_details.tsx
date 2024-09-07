import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  FlatList,
  ScrollView,
  AppRegistry,
  Image,
  Dimensions,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useSQLiteContext, SQLiteProvider } from "expo-sqlite";
import {
  getAllTasks,
  addNewTask,
  deleteTodo,
  getImages,
} from "./services/db_service";
import { PickerIOS } from "@react-native-picker/picker";
import { Task } from "./models/task";
import StackScreen from "./components/StackScreen";
import { TaskItems } from "./components/TaskItems";
import { TapButtons } from "./components/TapButtons";
import { TodoDetails } from "./components/TodoDetails";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { primaryColor } from "./helpers/constants";
import PagerView from "react-native-pager-view";
import * as Notifications from "expo-notifications";
import "react-native-gesture-handler";

/* 
  Image Reference and Credits:
  not_found.png - https://freesvgillustration.com/product/404-not-found/

*/

export default function TodoDetailsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const params = useLocalSearchParams();
  const [selectedTimer, setSelectedTimer] = useState(5);
  const [taskName, setTaskName] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();
  const [addTodoButtonState, setAddTodoButtonState] = useState(false);
  const [addTaskButtonState, setAddTaskButtonState] = useState(true);
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [todoNotes, setTodoNotes] = useState(params.todoNotes);
  const [images, setImages] = useState(null);
  const [completedStatus, setCompletedStatus] = useState(params.has_completed);

  const goToPage = (pageIndex) => {
    if (pagerRef.current) {
      pagerRef.current.setPage(pageIndex);
    }
  };

  useEffect(() => {
    // Request notification permissions
    async function getPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    }
    getPermissions();
    refreshTasks();
    refreshImages(parseInt(params.id));

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

  const scheduleNotification = async (
    taskName: string,
    duration: number,
    titleType = ""
  ) => {
    console.log("Scheduling notification...", taskName, duration);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleType,
        body: taskName,
        sound: true,
        icon: require("../assets/icons/notification-icon.png"),
      },
      trigger: {
        seconds: parseInt(duration),
      },
    });
  };

  const refreshImages = async (todoId: number) => {
    const images = await getImages(todoId);
    console.log("Images refr: ", images);
    setImages(images);
  };

  const refreshTasks = async () => {
    console.log("refreshTasks...");
    await getAllTasks(setTasks, parseInt(params.id));
  };

  const refreshTodos = async () => {
    console.log("refreshTodos...");
    await getTodos(params.setTodos);
  };

  const handlePageSelected = (event) => {
    event.persist();

    setCurrentPage(event.nativeEvent.position);
    if (event.nativeEvent.position === 0) {
      setAddTodoButtonState(false);
      setAddTaskButtonState(true);
    } else {
      setAddTodoButtonState(false);
      setAddTaskButtonState(false);
    }
  };

  let strippedTitle = params.title;
  if (params.title.length > 26) {
   strippedTitle = params.title.substring(0, 26) + "...";
  }
  return (
    <>
      <PagerView
        style={styles.pagerViewContainer}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={handlePageSelected}
      >
        <View key="1">
          <GestureHandlerRootView style={styles.container}>
            <Stack.Screen
              options={{
                title: "",
              }}
            ></Stack.Screen>
            <StackScreen
              title={strippedTitle}
              todoId={params.id}
              setTodos={params.setTodos}
              refreshTodos={params.refreshTodos}
              refreshTasks={refreshTasks}
              scheduleNotification={scheduleNotification}
              addTodoButtonState={addTodoButtonState}
              setAddTodoButtonState={setAddTodoButtonState}
              addTaskButtonState={addTaskButtonState}
              setAddTaskButtonState={setAddTaskButtonState}
            />
            <TapButtons goToPage={goToPage} currentPage={currentPage} />

            <View style={styles.TaskItemContainer}>
              <TaskItems
                tasks={tasks}
                todoId={params.id}
                todoTitle={params.title}
                categoryName={params.categoryName}
                categoryColor={params.categoryColor}
                completedStatus={completedStatus}
                setCompletedStatus={setCompletedStatus}
                refreshTasks={refreshTasks}
              />
            </View>

            <View style={styles.SpaceContainer}></View>
          </GestureHandlerRootView>
        </View>
        <View key="2">
          <TodoDetails
            goToPage={goToPage}
            currentPage={currentPage}
            todoTitle={params.title}
            todoNotes={todoNotes}
            setTodoNotes={setTodoNotes}
            todoId={params.id}
            params={params}
            images={images}
            setImages={setImages}
            refreshImages={refreshImages}
            completedStatus={completedStatus}
            setCompletedStatus={setCompletedStatus}
            navigation={navigation}
          />
        </View>
      </PagerView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  pagerViewContainer: {
    flex: 1,
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
    height: "94.5%",
  },
});
