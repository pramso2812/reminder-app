import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

import { useRouter } from "expo-router";

import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
const loginSchema = z.object({
  email: z.email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [secure, setSecure] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    try {
      const { email, password } = data;

      // 1. Attempt to login via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData?.user) {
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

        return;
      }

      // 2. Get the user_id from Auth and query your 'profile' table
      const userId = authData.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        alert("ไม่พบข้อมูลผู้ใช้ในระบบ");
        return;
      }

      // 3. Redirect
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Login failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ ...styles.container, paddingTop: insets?.top + 32 }}>
      <Image
        source={require("@/assets/images/logo/reminder-logo.png")}
        style={styles.logo}
      />
      <View style={{ ...styles.textContainer, paddingBottom: 64 }}>
        <Text
          style={{
            ...styles.title,
            color:
              theme === "light" ? Colors.light.primary : Colors.dark.primary,
          }}
        >
          ยินดีต้อนรับ
        </Text>
        <Text
          style={{
            ...styles.subTitle,
            color: theme === "light" ? Colors.light.text : Colors.dark.text,
          }}
        >
          ผู้ช่วยเตือนความจำของคุณ เพื่อวันที่จัดการได้ง่ายขึ้น
        </Text>
      </View>
      <View style={{ ...styles.textContainer }}>
        <Text
          style={{
            ...styles.subTitle,
            fontWeight: "bold",
            marginBottom: 8,
            color:
              theme === "light" ? Colors.light.primary : Colors.dark.primary,
          }}
        >
          เข้าสู่ระบบ
        </Text>
        {/* Username */}

        <TextInput
          placeholder="อีเมล"
          style={{
            ...styles.input,
            color: Colors[theme].text, // 🌓 adjusts text color
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onChangeText={(text) => setValue("email", text)}
        />

        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}
        <View style={{ justifyContent: "center" }}>
          {/* Password */}
          <TextInput
            placeholder="รหัสผ่าน"
            style={{
              ...styles.input,
              color: Colors[theme].text, // 🌓 adjusts text color
              backgroundColor: Colors[theme].background, // 🌓 adjusts text color
            }}
            secureTextEntry={secure}
            onChangeText={(text) => setValue("password", text)}
          />
          <TouchableOpacity
            onPress={() => setSecure(!secure)}
            style={{ position: "absolute", right: 16, bottom: 24 }}
          >
            <MaterialIcons
              name={secure ? "visibility-off" : "visibility"}
              size={24}
              color={Colors[theme].primary}
            />
          </TouchableOpacity>
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}
        </View>

        <Pressable
          style={[
            styles.button,
            loading && { backgroundColor: "#A5B4FC" }, // faded color when loading
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Text>
        </Pressable>
      </View>

      <TouchableOpacity
        style={{ marginTop: 32, alignItems: "center" }}
        onPress={() => router.navigate("/auth/register")}
      >
        <Text
          style={{
            ...styles.subTitle,
            fontWeight: "bold",
            color:
              theme === "light" ? Colors.light.primary : Colors.dark.primary,
          }}
        >
          ครั้งแรกใช่ไหม? สร้างบัญชีใหม่
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
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
});
