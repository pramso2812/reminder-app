import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { useCallback, useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

import dayjs from "dayjs";
import { getReminderCardStyle } from "./CardStyle";
import { getReminderTextStyle } from "./TextStyle";
import { isEmpty } from "lodash";
import { MaterialIcons } from "@expo/vector-icons";

export interface ReminderProps {
  title: string;
  description: string | null;
  due_date_time: string | null;
  id: string;
  is_completed?: boolean;
}

export function ReminderCard({
  item,
  theme,
  onPress,
  autoFocus,
  onCheck,
  onEdit,
  isCheck,
  isEditable = true,
  selectedIds,
}: {
  item: ReminderProps;
  theme: "light" | "dark";
  onPress?: (item: ReminderProps) => void;
  autoFocus?: boolean;
  onCheck: (item: ReminderProps) => void;
  onEdit?: (item: ReminderProps) => void;
  isCheck?: boolean;
  isEditable?: boolean;
  selectedIds?: string[];
}) {
  const [checked, setChecked] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");

  const handleClick = useCallback(() => {
    Keyboard.dismiss();

    const body = { ...item, title: title };
    onPress && onPress(body);
  }, [item, title, onPress]);

  const isSelected = selectedIds?.includes(item?.id);

  useEffect(() => {
    if (!isEmpty(item?.title)) setTitle(item?.title);

    if (item?.is_completed) setChecked(item?.is_completed ?? false);
  }, [item?.is_completed, item?.title]);
  return (
    <TouchableWithoutFeedback onPress={handleClick}>
      <ThemedView
        style={[
          styles.card,
          getReminderCardStyle(
            item?.due_date_time ?? "",
            theme,
            item?.is_completed
          ),
        ]}
      >
        <View style={styles.row}>
          <Checkbox
            value={isSelected ?? checked}
            onValueChange={() => {
              setChecked(!checked);

              onCheck(item);
            }}
            color={checked ? Colors[theme].primary : undefined}
            style={styles.checkbox}
          />
          <View style={{ width: "80%" }}>
            <TextInput
              editable={isEditable}
              maxLength={25}
              value={title}
              onChangeText={setTitle}
              onBlur={() => {
                setIsEditing(false);
                handleClick();
              }}
              onFocus={() => setIsEditing(true)}
              style={[
                styles.input,
                {
                  fontWeight: "bold",
                  fontSize: 18,
                  borderBottomWidth: isEditing ? 1 : 0,
                  borderBottomColor: Colors[theme].primary,
                  color: Colors[theme].primary, // 🌓 adjusts text color
                },
              ]}
              autoFocus={autoFocus}
            />
            {!isEmpty(item?.description) && (
              <ThemedText
                type="defaultSemiBold"
                style={[{ color: Colors[theme].text }]}
              >
                {item?.description}
              </ThemedText>
            )}
            {!isEmpty(item?.due_date_time) && (
              <ThemedText
                type="defaultSemiBold"
                style={[
                  getReminderTextStyle(
                    item.due_date_time ?? "",
                    theme,
                    item?.is_completed
                  ),
                ]}
              >
                {dayjs(item?.due_date_time)
                  .locale("th")
                  .format("DD MMMM YYYY HH:mm น.")}
              </ThemedText>
            )}
          </View>
        </View>
        {isEditing && (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              onEdit && onEdit(item);
            }}
            activeOpacity={1}
          >
            <MaterialIcons
              name="edit"
              size={24}
              color={Colors[theme]?.primary}
            />
          </TouchableOpacity>
        )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 90,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    marginRight: 16,
  },
  input: {
    fontSize: 16,
    paddingVertical: 4,
  },
});
