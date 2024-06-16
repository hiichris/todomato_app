import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import StackScreen from "./components/StackScreen";

export default function TodoDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StackScreen title={params.title} />
     
      <Text>{params.title} {params.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
