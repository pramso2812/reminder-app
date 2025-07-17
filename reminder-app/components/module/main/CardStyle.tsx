import dayjs from "dayjs";
import { Colors } from "@/constants/Colors";

export function getReminderCardStyle(
  dateString: string,
  theme: "light" | "dark"
) {
  const now = dayjs();
  const dueDate = dayjs(dateString);

  const isPast = dueDate.isBefore(now, "day");

  const isTodayOrTomorrow = dueDate.diff(now, "day") <= 1;

  let bg = Colors[theme].primary + "1A";

  if (isPast) {
    bg = Colors[theme].error + "1A"; // 10% opacity = hex "1A"
  } else if (isTodayOrTomorrow) {
    bg = Colors[theme].secondary + "1A";
  }

  return {
    backgroundColor: bg,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  };
}
