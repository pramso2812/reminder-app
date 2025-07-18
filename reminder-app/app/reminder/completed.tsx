import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";

import { IconSymbol } from "@/components/ui/IconSymbol";

import { ReminderCard } from "@/components/module/main/Card";
import { useCallback, useState } from "react";

import { type ReminderProps } from "@/components/module/main/Card";
import { SwipeListView } from "react-native-swipe-list-view";

import { supabase } from "@/lib/supabase";

export default function CompletedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const [openRowKey, setOpenRowKey] = useState<string | null>(null);

  const [reminders, setReminders] = useState<ReminderProps[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_completed", true)
      .eq("is_deleted", false)
      .order("due_date_time", { ascending: true });

    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      setReminders(data);
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

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("reminders")
          .update({ is_deleted: true })
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

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <SwipeListView
        keyboardShouldPersistTaps="handled"
        data={reminders}
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
            isCheck
          />
        )}
        renderHiddenItem={({ item }) => {
          return openRowKey === item.id ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleDelete(item.id)}
              style={styles.rowBack}
            >
              <IconSymbol
                size={24}
                name="trash.fill"
                color={Colors[theme]?.primary}
              />
            </TouchableOpacity>
          ) : (
            <ThemedView
              style={[styles.rowBack, { backgroundColor: "transparent" }]}
            />
          );
        }}
        contentContainerStyle={{ gap: 8 }}
        rightOpenValue={-75}
        onRowOpen={(rowKey) => setOpenRowKey(rowKey)}
        onRowClose={() => setOpenRowKey(null)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  logo: {
    width: 72,
    height: 72,
  },
  rowBack: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 24,
    borderRadius: 12,
    height: 90,
  },
});
