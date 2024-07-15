import { Stack } from "expo-router";

export default function RootLayout() {
  const default_options = {
    title: "",
  };
  return (
    <Stack>
      <Stack.Screen name="index"
        options={default_options}
      />
      <Stack.Screen name="todo_details"
        options={default_options} 
      />
    </Stack>
  );
}
