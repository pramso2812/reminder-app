import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";

export function FloatingAddButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  const theme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: Colors[theme].primary, bottom: insets.bottom + 100 },
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <IconSymbol name="plus" size={20} color="#fff" />
      <ThemedText style={{ ...styles.text }}>เพิ่มรายการ</ThemedText>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 4, // for Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
