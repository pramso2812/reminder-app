import { Stack, useRouter } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserLayout() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => (
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingTop: insets?.top + 32,
              }}
            >
              <Pressable onPress={() => router.back()}>
                <IconSymbol
                  name="chevron.left"
                  size={24}
                  color={Colors[theme].primary}
                />
              </Pressable>
              <ThemedText
                type="subtitle"
                style={{
                  marginLeft: 16,
                  color: Colors[theme].primary,
                }}
              >
                แก้ไขบัญชี
              </ThemedText>
            </ThemedView>
          ),
        }}
      />
    </Stack>
  );
}
