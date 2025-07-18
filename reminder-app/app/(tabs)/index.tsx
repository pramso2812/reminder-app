import { Image } from "expo-image";
import {
  Alert,
  FlatList,
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

import { ReminderCard } from "@/components/module/main/Card";
import { useCallback, useState, useRef } from "react";
import { FloatingAddButton } from "@/components/module/main/AddButton";
import { type ReminderProps } from "@/components/module/main/Card";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/authContext";

import { isEmpty } from "lodash";

import dayjs from "dayjs";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const { authUser, profile } = useAuth(); // ensure user is logged in

  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const [reminders, setReminders] = useState<ReminderProps[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const hasAlertedRef = useRef(false); // 🧠 กันแสดงซ้ำ

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

      const nearDueReminders = (data ?? []).filter(
        (reminder: ReminderProps) => {
          if (!reminder.due_date_time) return false;

          const dueDate = dayjs(reminder.due_date_time);
          const isPast = dueDate.isBefore(now, "day");
          const isTodayOrTomorrow = dueDate.diff(now, "day") <= 1;

          return isPast || isTodayOrTomorrow;
        }
      );

      const nearDueCount = nearDueReminders?.length;

      if (nearDueCount > 0 && !hasAlertedRef.current) {
        hasAlertedRef.current = true; // ✅ ตั้งค่าว่า alert แล้ว
        Alert.alert(
          "แจ้งเตือน",
          `คุณมี ${nearDueCount} รายการที่ใกล้ครบกำหนดหรือเลยกำหนดแล้ว`
        );
      }

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

  const handleDelete = useCallback(async () => {
    router.navigate("/reminder/delete");
  }, [router]);

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

        <NotificationBell
          count={count}
          onPress={() => router.navigate("/reminder/notification")}
        />
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
        contentContainerStyle={{ gap: 8 }}
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
    height: 90,
  },
});
