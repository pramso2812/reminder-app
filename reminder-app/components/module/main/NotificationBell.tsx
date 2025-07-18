import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Colors } from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function NotificationBell({
  count = 0,
  onPress,
  theme = "light",
}: {
  count?: number;
  onPress: () => void;
  theme?: "light" | "dark";
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="bell"
          size={32}
          color={Colors[theme]?.secondary}
        />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {count > 99 ? "99+" : count.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
