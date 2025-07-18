import "dotenv/config";

export default {
  expo: {
    assetBundlePatterns: ["**/*"],
    name: "reminder-app",
    slug: "reminder-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo/reminder-logo.png",
    scheme: "reminderapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.petchprams.reminderapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.petchprams.reminderapp",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo/reminder-logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo/reminder-logo.png",
          imageWidth: 200,
          backgroundColor: "#ffffff",
        },
      ],
      "expo-secure-store",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "b87c549f-ad83-4426-a6ab-cb915e71ffc8",
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    owner: "petchprams",
  },
};
