import { Stack, useRouter } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReminderLayout() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  const headerComponent = (title: string) => {
    return (
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: insets?.top + 32,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="chevron-left"
            size={32}
            color={Colors[theme]?.primary}
          />
        </Pressable>
        <ThemedText
          type="subtitle"
          style={{
            marginLeft: 16,
            color: Colors[theme].primary,
          }}
        >
          {title}
        </ThemedText>
      </ThemedView>
    );
  };
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => headerComponent("จดบันทึก"),
        }}
      />
      <Stack.Screen
        name="completed"
        options={{
          header: () => headerComponent("บันทึกที่สำเร็จแล้ว"),
        }}
      />
      <Stack.Screen
        name="delete"
        options={{
          header: () => headerComponent("ลบบันทึก"),
        }}
      />
      <Stack.Screen
        name="notification"
        options={{
          header: () => headerComponent("แจ้งเตือน"),
        }}
      />
    </Stack>
  );
}
