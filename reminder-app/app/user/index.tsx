import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/authContext";
import { isEmpty } from "lodash";

// 🧠 Schema
const registerSchema = z
  .object({
    email: z.email().optional(), // shown, but not editable
    username: z
      .string()
      .min(6, "ชื่อผู้ใช้ต้องมีอย่างน้อย 6 ตัวอักษร")
      .optional(),
    password: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 8,
        "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
      )
      .refine(
        (val) => !val || /[A-Z]/.test(val),
        "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
      )
      .refine(
        (val) => !val || /[0-9]/.test(val),
        "ต้องมีตัวเลขอย่างน้อย 1 ตัว"
      ),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? "light";

  const { authUser, profile, getUser } = useAuth();
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
      if (!isEmpty(item?.password)) {
        // 1. Update Auth (email/password)
        const { error: authError } = await supabase.auth.updateUser({
          password: item?.password, // optional, only if changed
        });

        if (authError) {
          alert("อัปเดตบัญชีไม่สำเร็จ: " + authError.message);
          return;
        }
      }
      if (!isEmpty(item?.username)) {
        // 2. Update profile table
        const { error: dbError } = await supabase
          .from("profile")
          .update({ username: item?.username })
          .eq("id", authUser.id);

        if (dbError) {
          alert("อัปเดตชื่อผู้ใช้ไม่สำเร็จ: " + dbError.message);
          return;
        }
      }

      await getUser();

      alert("อัปเดตข้อมูลสำเร็จ!");

      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ ...styles.container, paddingTop: insets?.top }}>
      <View style={{ ...styles.textContainer }}>
        <TextInput
          defaultValue={profile?.username}
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
          defaultValue={authUser?.email}
          editable={false}
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
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Text>
        </Pressable>
      </View>
    </ThemedView>
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
