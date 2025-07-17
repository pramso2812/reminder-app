import { Image } from "expo-image";
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";

import { NotificationBell } from "@/components/module/main/NotificationBell";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { ReminderCard } from "@/components/module/main/Card";
import { useCallback, useState } from "react";
import { FloatingAddButton } from "@/components/module/main/AddButton";
import { type ReminderProps } from "@/components/module/main/Card";
import { SwipeListView } from "react-native-swipe-list-view";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/authContext";

import { isEmpty } from "lodash";

import dayjs from "dayjs";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const { authUser, profile } = useAuth(); // ensure user is logged in

  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [openRowKey, setOpenRowKey] = useState<string | null>(null);

  const [reminders, setReminders] = useState<ReminderProps[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

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

      const nearDueCount = (data ?? []).filter((reminder: ReminderProps) => {
        const dueDate = dayjs(reminder.due_date_time);
        const isPast = dueDate.isBefore(now, "day"); // before today
        const isTodayOrTomorrow = dueDate.diff(now, "day") <= 1;

        return !isPast && isTodayOrTomorrow;
      }).length;
      setCount(nearDueCount);
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

  const handleAddNewItem = useCallback(async () => {
    if (!authUser?.id) return;

    if (!isEmpty(authUser?.id)) {
      const { data, error } = await supabase
        .from("reminders")
        .insert({
          user_id: authUser?.id,
          title: null,
          description: null,
          due_date_time: null,
        })
        .select()
        .single();

      if (!error && data) {
        setReminders((prev) => [data, ...prev]); // use the full object from Supabase
        setNewlyAddedId(data?.id); // ✅ track the new ID for auto-focus
      } else {
        console.error("Failed to insert reminder:", error);
      }
    }
  }, [authUser?.id]);

  const handleCheckItem = useCallback(
    async (item: ReminderProps) => {
      try {
        const { id } = item;

        const { error } = await supabase
          .from("reminders")
          .update({ is_completed: true })
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
    <ThemedView style={{ flex: 1, paddingTop: insets.top + 16 }}>
      <ThemedView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        <ThemedView
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Image
            source={require("@/assets/images/logo/reminder-logo.png")}
            style={styles.logo}
          />
          <ThemedView>
            <ThemedText type="default" style={{ color: Colors[theme]?.text }}>
              เริ่มจดบันทึกกัน!
            </ThemedText>
            <ThemedText type="title" style={{ color: Colors[theme]?.primary }}>
              {profile?.username}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <NotificationBell count={count} onPress={() => null} />
      </ThemedView>
      <ThemedView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          paddingTop: 32,
        }}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ color: Colors[theme]?.primary }}
        >
          รายการจดบันทึก
        </ThemedText>
      </ThemedView>
      <SwipeListView
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard
            item={item}
            theme={theme}
            onPress={handleChangeTitle}
            autoFocus={item.id === newlyAddedId}
            onCheck={handleCheckItem}
            onEdit={() =>
              router.navigate({
                pathname: "/reminder",
                params: { id: item?.id },
              })
            }
          />
        )}
        renderHiddenItem={({ item }) => {
          return openRowKey === item.id ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleDelete(item.id)}
            >
              <ThemedView style={styles.rowBack}>
                <IconSymbol
                  size={24}
                  name="trash.fill"
                  color={Colors[theme]?.primary}
                />
              </ThemedView>
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

      <FloatingAddButton onPress={handleAddNewItem} loading={loading} />
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
    height: 100,
  },
});
