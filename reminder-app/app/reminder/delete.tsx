import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useRouter } from "expo-router";

import { ReminderCard } from "@/components/module/main/Card";
import { useCallback, useState } from "react";

import { type ReminderProps } from "@/components/module/main/Card";

import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";

export default function DeleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const [reminders, setReminders] = useState<ReminderProps[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
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

  const handleCheckItem = useCallback((item: ReminderProps) => {
    const { id } = item;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("reminders")
        .update({ is_deleted: true })
        .in("id", selectedIds); // ✅ Use `.in()` for multiple IDs

      if (error) {
        console.error("Failed to update reminders:", error);
        Alert.alert("ไม่สามารถลบรายการได้");
      } else {
        fetchReminders(); // ✅ Refresh data

        router.back();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("เกิดข้อผิดพลาด", "โปรดลองใหม่อีกครั้ง");
    }
  }, [fetchReminders, router, selectedIds]);

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
          เลือกรายการที่ต้องการลบ
        </ThemedText>
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
            isEditable={false}
            onCheck={handleCheckItem}
            selectedIds={selectedIds}
          />
        )}
      />

      <ThemedView style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.button,
            loading && {
              backgroundColor: "#A5B4FC",
            }, // faded color when loading
            selectedIds?.length === 0 && {
              backgroundColor: "#A5B4FC",
            }, // faded color when loading
          ]}
          onPress={handleDelete}
          disabled={loading ?? selectedIds?.length === 0}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? "กำลังเพิ่มจดบันทึก..." : "ยืนยัน"}
          </ThemedText>
        </Pressable>
      </ThemedView>
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
  buttonContainer: {
    width: "100%",
    paddingBottom: 16 * 3,
    position: "absolute",
    paddingHorizontal: 16,
    borderTopColor: "rgba(0,0,0,0.1)",
    borderTopWidth: 1,
    bottom: 0,
    gap: 16,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
