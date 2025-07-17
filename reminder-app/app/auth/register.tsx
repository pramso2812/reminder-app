import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

// 🧠 Schema
const registerSchema = z
  .object({
    username: z.string().min(6, "ชื่อผู้ใช้ต้องมีอย่างน้อย 6 ตัวอักษร"),
    email: z.email("อีเมลไม่ถูกต้อง"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
      .regex(/[0-9]/, "ต้องมีตัวเลขอย่างน้อย 1 ตัว"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const {
    setValue,
    handleSubmit,

    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (item: RegisterForm) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: item.email, // e.g., "user@example.com"
        password: item.password, // must be at least 6 chars
      });

      if (error) {
        alert("ไม่สามารถสมัครสมาชิกได้: " + error.message);
        return;
      }

      if (data?.user) {
        await supabase.from("profile").insert({
          id: data.user.id, // use auth.uid() as PK
          username: item?.username, // optional
        });
      }

      alert("สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมล");
      router.replace("/auth"); // Redirect to login screen
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
          สมัครสมาชิก
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
          สร้างบัญชีใหม่
        </Text>
        <TextInput
          placeholder="ชื่อผู้ใช้"
          style={{
            ...styles.input,
            color: Colors[theme].text, // 🌓 adjusts text color
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onChangeText={(text) => setValue("username", text)}
        />
        {errors.username && (
          <Text style={styles.error}>{errors.username.message}</Text>
        )}

        <TextInput
          placeholder="อีเมล"
          keyboardType="email-address"
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

        <TextInput
          placeholder="รหัสผ่าน"
          secureTextEntry
          style={{
            ...styles.input,
            color: Colors[theme].text, // 🌓 adjusts text color
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onChangeText={(text) => {
            setValue("password", text);
          }}
        />
        {errors.password && (
          <Text style={styles.error}>{errors.password.message}</Text>
        )}

        <TextInput
          placeholder="ยืนยันรหัสผ่าน"
          secureTextEntry
          style={{
            ...styles.input,
            color: Colors[theme].text, // 🌓 adjusts text color
            backgroundColor: Colors[theme].background, // 🌓 adjusts text color
          }}
          onChangeText={(text) => setValue("confirmPassword", text)}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword.message}</Text>
        )}
        <Pressable
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </Text>
        </Pressable>
      </View>
      <TouchableOpacity
        style={{ marginTop: 32, alignItems: "center" }}
        onPress={() => router.navigate("/auth")}
      >
        <Text
          style={{
            ...styles.subTitle,
            fontWeight: "bold",
            color:
              theme === "light" ? Colors.light.primary : Colors.dark.primary,
          }}
        >
          มีบัญชีแล้ว? เข้าสู่ระบบ
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
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 4,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  textContainer: {
    gap: 8,
  },
});
