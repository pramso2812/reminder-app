import {
  View,
  Text,
  TextInput,
  Button,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { useAuth } from "@/contexts/authContext";
import { isEmpty } from "lodash";
import { supabase } from "@/lib/supabase";

dayjs.locale("th");
// ✅ Zod Schema
const reminderSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อเรื่อง"),
  description: z.string().optional(),
  date: z.date().nullable().optional(),
});

// ✅ Infer form type
type ReminderFormData = z.infer<typeof reminderSchema>;

export default function ReminderForm() {
  const params = useLocalSearchParams();

  const router = useRouter();

  const theme = useColorScheme() ?? "light";

  const { authUser } = useAuth(); // ensure user is logged in

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      // Set date and open time picker next
      const currentDate = selectedDate || new Date();
      setValue("date", currentDate, { shouldValidate: true });
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime: any) => {
    setShowTimePicker(false);
    if (event.type === "set" && selectedTime) {
      const currentDate = watch("date") || new Date();

      // Combine time into the selected date
      const updatedDate = new Date(currentDate);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());

      setValue("date", updatedDate, { shouldValidate: true });
    }
  };

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      description: "",
      date: null,
    },
  });

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("id", params?.id);

    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      const reminder = data[0];
      setValue("title", reminder?.title);
      setValue("description", reminder?.description ?? "");
      setValue("date", reminder?.due_date_time ?? "");
    }

    setLoading(false);
  }, [params?.id, setValue]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAddNewItem = useCallback(
    async (item: ReminderFormData) => {
      setLoading(true);
      if (!params?.id) return;
      if (!authUser?.id) return;

      if (!isEmpty(params?.id) && !isEmpty(authUser?.id)) {
        const { error } = await supabase
          .from("reminders")
          .update({
            user_id: authUser?.id,
            title: item?.title,
            description: item?.description ?? null,
            due_date_time: item?.date ?? null,
          })
          .eq("id", params?.id);

        if (!error) {
          router.back();
        } else {
          console.error("Failed to insert reminder:", error);
        }
      }

      setLoading(false);
    },
    [authUser?.id, params?.id, router]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={{ padding: 16 }}>
        <TextInput
          defaultValue={watch("title")}
          placeholder="จดบันทึก"
          style={{
            ...styles.input,
            color: Colors[theme].text, // 🌓 adjusts text color
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onChangeText={(text) => setValue("title", text)}
        />

        {errors.title && (
          <ThemedText style={styles.error}>{errors.title.message}</ThemedText>
        )}
        
        <TextInput
          defaultValue={watch("description")}
          placeholder="รายละเอียด (ไม่จำเป็น)"
          style={{
            ...styles.input,
            color: Colors[theme].text, // 🌓 adjusts text color
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onChangeText={(text) => setValue("description", text)}
        />

        {errors.description && (
          <ThemedText style={styles.error}>
            {errors.description.message}
          </ThemedText>
        )}
        <TouchableOpacity
          style={{
            ...styles.input,
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onPress={() => setShowDatePicker(!showDatePicker)}
          activeOpacity={0.7}
        >
          <ThemedText
            style={{
              color: watch("date")
                ? Colors[theme].text
                : Colors[theme].placeholder, // 🌓 adjusts text color
            }}
          >
            {watch("date")
              ? dayjs(watch("date"))
                  .locale("th")
                  .format("วันที่ D MMMM YYYY เวลา HH:mm น.")
              : "เลือกวันที่ (ไม่บังคับ)"}
          </ThemedText>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          {showDatePicker && (
            <View>
              <DateTimePicker
                locale="th-TH"
                value={watch("date") || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
              {Platform.OS === "ios" && (
                <Button
                  title="บันทึกวันที่"
                  onPress={() => {
                    const selectedDate = watch("date") || new Date();
                    handleDateChange(
                      { type: "set" } as any, // 👈 mimic DateTimePickerEvent
                      selectedDate
                    );
                  }}
                  color={Colors[theme]?.primary}
                />
              )}
            </View>
          )}
          {showTimePicker && (
            <View>
              <DateTimePicker
                locale="th-TH"
                value={watch("date") || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
              />
              {Platform.OS === "ios" && (
                <Button
                  title="บันทึกเวลา"
                  onPress={() => {
                    const selectedDate = watch("date") || new Date();
                    handleTimeChange(
                      { type: "set" } as any, // 👈 mimic DateTimePickerEvent
                      selectedDate
                    );
                  }}
                  color={Colors[theme]?.primary}
                />
              )}
            </View>
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.button,
            loading && { backgroundColor: "#A5B4FC" }, // faded color when loading
          ]}
          onPress={handleSubmit(handleAddNewItem)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "กำลังเพิ่มจดบันทึก..." : "ยืนยัน"}
          </Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 16,
  },
  input: {
    width: "100%",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    height: 48,
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
  error: {
    alignSelf: "flex-start",
    color: "#EF4444",
    marginBottom: 4,
    fontSize: 13,
  },
  textContainer: {
    gap: 8,
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
});
