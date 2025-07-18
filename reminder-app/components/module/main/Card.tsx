import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import { useCallback, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import dayjs from "dayjs";
import { getReminderCardStyle } from "./CardStyle";
import { getReminderTextStyle } from "./TextStyle";
import { isEmpty } from "lodash";

export interface ReminderProps {
  title: string;
  description: string | null;
  due_date_time: string | null;
  id: string;
}

export function ReminderCard({
  item,
  theme,
  onPress,
  autoFocus,
  onCheck,
  onEdit,
  isCheck,
}: {
  item: ReminderProps;
  theme: "light" | "dark";
  onPress: (item: ReminderProps) => void;
  autoFocus?: boolean;
  onCheck: (item: ReminderProps) => void;
  onEdit: (item: ReminderProps) => void;
  isCheck?: boolean;
}) {
  const [checked, setChecked] = useState<boolean>(isCheck ?? false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [title, setTitle] = useState<string>(item.title);

  const handleClick = useCallback(() => {
    Keyboard.dismiss();

    const body = { ...item, title: title };
    onPress(body);
  }, [item, title, onPress]);

  return (
    <TouchableWithoutFeedback onPress={handleClick}>
      <ThemedView
        style={[
          styles.card,
          getReminderCardStyle(item?.due_date_time ?? "", theme, isCheck),
        ]}
      >
        <View style={styles.row}>
          <Checkbox
            value={checked}
            onValueChange={() => {
              setChecked(!checked);

              onCheck(item);
            }}
            color={checked ? Colors[theme].primary : undefined}
            style={styles.checkbox}
          />
          <View style={{ width: "80%" }}>
            <TextInput
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
                    isCheck
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
              onEdit(item);
            }}
            activeOpacity={1}
          >
            <IconSymbol name="pencil" size={24} color={Colors[theme].primary} />
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
