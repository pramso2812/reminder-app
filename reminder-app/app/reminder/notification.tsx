import {
  Alert,
  FlatList,
  Keyboard,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFocusEffect, useRouter } from "expo-router";

import { ReminderCard } from "@/components/module/main/Card";
import { useCallback, useState } from "react";

import { type ReminderProps } from "@/components/module/main/Card";

import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";

import { Colors } from "@/constants/Colors";
import dayjs from "dayjs";
import { MaterialIcons } from "@expo/vector-icons";

export default function NotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const [reminders, setReminders] = useState<ReminderProps[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_completed", false)
      .eq("is_deleted", false)
      .order("due_date_time", { ascending: true });

    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      const now = dayjs();
      const filtered = data.filter((reminder: ReminderProps) => {
        if (!reminder.due_date_time) return false;

        const dueDate = dayjs(reminder.due_date_time);
        const diffInDays = dueDate.diff(now, "day");

        return dueDate.isBefore(now, "day") || diffInDays <= 1; // passed or within today/tomorrow
      });

      setReminders(filtered);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [fetchReminders])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss(); // ✅ Close keyboard when screen is unfocused
      };
    }, [])
  );

  const handleChangeTitle = useCallback(
    async (item: ReminderProps) => {
      try {
        const { id, title } = item;

        const { error } = await supabase
          .from("reminders")
          .update({ title })
          .eq("id", id);

        if (error) {
          console.error("Failed to update reminder:", error);
          Alert.alert("ไม่สามารถบันทึกการเปลี่ยนแปลงได้");
        } else {
          fetchReminders();
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        Alert.alert("เกิดข้อผิดพลาด", "โปรดลองใหม่อีกครั้ง");
      }
    },
    [fetchReminders]
  );

  const handleCheckItem = useCallback(
    async (item: ReminderProps) => {
      try {
        const { id } = item;

        const { error } = await supabase
          .from("reminders")
          .update({ is_completed: false })
          .eq("id", id);

        if (error) {
          console.error("Failed to update reminder:", error);
          Alert.alert("ไม่สามารถบันทึกการเปลี่ยนแปลงได้");
        } else {
          fetchReminders();
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        Alert.alert("เกิดข้อผิดพลาด", "โปรดลองใหม่อีกครั้ง");
      }
    },
    [fetchReminders]
  );

  const handleDelete = useCallback(async () => {
    router.navigate("/reminder/delete");
  }, [router]);

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <ThemedView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ color: Colors[theme]?.primary }}
        >
          รายการจดบันทึก
        </ThemedText>
        <TouchableOpacity activeOpacity={0.7} onPress={handleDelete}>
          <MaterialIcons
            name="delete"
            size={24}
            color={Colors[theme]?.primary}
          />
        </TouchableOpacity>
      </ThemedView>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={reminders}
        contentContainerStyle={{ gap: 8, paddingBottom: 150 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard
            item={item}
            theme={theme}
            onPress={handleChangeTitle}
            onCheck={handleCheckItem}
            onEdit={() =>
              router.navigate({
                pathname: "/reminder",
                params: { id: item?.id },
              })
            }
          />
        )}
      />
    </ThemedView>
  );
}
