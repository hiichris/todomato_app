import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";
import { View, Text, StyleSheet, Button, TextInput, FlatList, ScrollView, AppRegistry, Image, Dimensions, useWindowDimensions, Pressable } from "react-native";
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
import PagerView from 'react-native-pager-view';

/* 
  Image Reference and Credits:
  not_found.png - https://freesvgillustration.com/product/404-not-found/

*/

function NoAssignedTasks({ todoTitle, params, refreshTasks, scheduleNotification, addTodoButtonState, setAddTodoButtonState, addTaskButtonState, setAddTaskButtonState }) {
  return (
    <View style={styles.noAssignedTaskContainer}>
      <Stack.Screen
        options={{
          title: "",
        }}
      ></Stack.Screen>
      <StackScreen
        title={params.title.substring(0, 10)}
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

function TabButtons({ goToPage, currentPage }) {
  return (
    <View style={styles.tabViewButtonsContainer}>
      <Pressable onPress={() => goToPage(0)}>
        <Text style={currentPage == 1 ? styles.tabViewInactiveButton : styles.tabViewButton}>Tasks</Text>
      </Pressable>
      <Pressable onPress={() => goToPage(1)}>
        <Text style={currentPage == 0 ? styles.tabViewInactiveButton : styles.tabViewButton}>Details</Text>
      </Pressable>
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
  const [addTodoButtonState, setAddTodoButtonState] = useState(false);
  const [addTaskButtonState, setAddTaskButtonState] = useState(true);
  const pagerRef = useRef<PagerView>(null);
  const [tabViewIndex, setTabViewIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const goToPage = (pageIndex) => {
    if (pagerRef.current) {
      pagerRef.current.setPage(pageIndex);
      // Alternatively, use setPageWithoutAnimation(pageIndex) for no animation

    }
  };

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

  const handlePageSelected = (event) => {
    setCurrentPage(event.nativeEvent.position);
  }

  return (
    <>
      {
        tasks.length > 0 ?
          <PagerView style={styles.pagerViewContainer} initialPage={0} ref={pagerRef} onPageSelected={handlePageSelected}>
            <View key="1">
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
                  refreshTodos={params.refreshTodos}
                  refreshTasks={refreshTasks}
                  scheduleNotification={scheduleNotification}
                  addTodoButtonState={addTodoButtonState}
                  setAddTodoButtonState={setAddTodoButtonState}
                  addTaskButtonState={addTaskButtonState}
                  setAddTaskButtonState={setAddTaskButtonState}
                />
                <TabButtons goToPage={goToPage} currentPage={currentPage} />

                <View style={styles.TaskItemContainer}>

                  <TaskItems tasks={tasks} todoTitle={params.title} refreshTasks={refreshTasks} />
                </View>

                <View><Button title="Next page" onPress={() => goToPage(1)} /></View>
                <View style={styles.SpaceContainer}></View>
              </GestureHandlerRootView>
            </View>
            <View key="2">
              <View style={styles.detailsContainer}>
                <TabButtons goToPage={goToPage} currentPage={currentPage} />
                <View style={styles.detailsPlaceholder}>
                  <Text>Details Placeholder</Text>
                </View>
              </View>
            </View>
          </PagerView>
          : <NoAssignedTasks
            todoTitle={params.title}
            params={params}
            refreshTasks={refreshTasks}
            scheduleNotification={scheduleNotification}
            addTodoButtonState={addTodoButtonState}
            setAddTodoButtonState={setAddTodoButtonState}
            addTaskButtonState={addTaskButtonState}
            setAddTaskButtonState={setAddTaskButtonState}
          />
      }
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
    height: "90%",
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
  tabViewButtonsContainer: {
    flex: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  tabViewButton: {
    fontSize: 16,
    borderWidth: 1,
    borderBottomColor: primaryColor,
    color: primaryColor,
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderColor: primaryColor,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  tabViewInactiveButton: {
    fontSize: 16,
    borderBottomWidth: 1,
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderColor: "gray",
    borderRadius: 10,
    marginHorizontal: 2,
    color: "gray",
  },
  detailsContainer: {
    flex: 1,
  },
  detailsPlaceholder: {
    flex: 150,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  }

});
