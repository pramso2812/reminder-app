import { Image } from "expo-image";
import {
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function UserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";
  const { profile, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    router.replace("/auth");
  };

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
        <ThemedView style={styles.titleContainer}>
          <Image
            source={require("@/assets/images/logo/reminder-logo.png")}
            style={styles.logo}
          />
          <ThemedView>
            <ThemedText type="default" style={{ color: Colors[theme]?.text }}>
              สวัสดี!
            </ThemedText>
            <ThemedText type="title" style={{ color: Colors[theme]?.primary }}>
              {profile?.username}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <ScrollView>
        {/* Header */}

        {/* Buttons Section */}
        <View
          style={{ ...styles.buttonContainer, paddingTop: insets?.top + 16 }}
        >
          <TouchableOpacity
            // onPress={() => router.push("/edit-profile")}
            style={[
              styles.outlinedButton,
              { borderColor: Colors[theme].primary },
            ]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ color: Colors[theme].primary }}
            >
              แก้ไขบัญชี
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() => router.push("/completed")}
            style={[
              styles.outlinedButton,
              { borderColor: Colors[theme].primary },
            ]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ color: Colors[theme].primary }}
            >
              บันทึกที่สำเร็จแล้ว
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[
              styles.signOutButton,
              { backgroundColor: Colors[theme].primary },
            ]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
              ออกจากระบบ
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 16,
  },
  outlinedButton: {
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  signOutButton: {
    marginTop: 32,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  footer: {},
});
