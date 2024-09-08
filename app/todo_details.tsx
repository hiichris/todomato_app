import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useGlobalSearchParams,
} from "expo-router";
import { View, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import { getAllTasks, getImages } from "./services/db_service";
import { Task } from "./models/task";
import StackScreen from "./components/StackScreen";
import { TaskItems } from "./components/TaskItems";
import { TapButtons } from "./components/TapButtons";
import { TodoDetails } from "./components/TodoDetails";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";
import * as Notifications from "expo-notifications";
import "react-native-gesture-handler";

/* 
  Image Reference and Credits:
  not_found.png - https://freesvgillustration.com/product/404-not-found/
*/

// Todo Details Screen Component
export default function TodoDetailsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const params = useLocalSearchParams();
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
  const { passiveTask = false } = useGlobalSearchParams();

  // Function to navigate to a specific page using pagerRef
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

    // Run on component mount
    getPermissions();
    refreshTasks();
    refreshImages(parseInt(params.id));

    // Configure notification behavior
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
      // Remove notification listeners on component unmount
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      // Remove response listeners
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Function to schedule a notification
  const scheduleNotification = async (
    taskName: string,
    duration: number,
    titleType = ""
  ) => {
    // Schedule a notification
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

  // Function to refresh images from the database
  const refreshImages = async (todoId: number) => {
    const images = await getImages(todoId);
    console.log("Images refr: ", images);
    setImages(images);
  };

  // Function to refresh tasks from the database
  const refreshTasks = async () => {
    console.log("refreshTasks...");
    await getAllTasks(setTasks, parseInt(params.id));
  };

  // Function to handle page selection
  const handlePageSelected = (event) => {
    event.persist();

    // Set the current page and update the add button state
    setCurrentPage(event.nativeEvent.position);
    if (event.nativeEvent.position === 0) {
      setAddTodoButtonState(false);
      setAddTaskButtonState(true);
    } else {
      setAddTodoButtonState(false);
      setAddTaskButtonState(false);
    }
  };

  // If the title is too long, trim it
  let strippedTitle = params.title;
  if (params.title && params.title.length > 26) {
    strippedTitle = params.title.substring(0, 26) + "...";
  } else {
    strippedTitle = params.title;
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
              expandPassiveAssignmentModal={passiveTask}
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
