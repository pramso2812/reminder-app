import dayjs from "dayjs";
import { Colors } from "@/constants/Colors";

export function getReminderTextStyle(
  dateString: string,
  theme: "light" | "dark"
) {
  const now = dayjs();
  const dueDate = dayjs(dateString);

  const isPast = dueDate.isBefore(now, "day");
  const isTodayOrTomorrow = dueDate.diff(now, "day") <= 1;

  let text = Colors[theme].text;

  if (isPast) {
    text = Colors[theme].error;
  } else if (isTodayOrTomorrow) {
    text = Colors[theme].secondary;
  }

  return {
    color: text,
  };
}
