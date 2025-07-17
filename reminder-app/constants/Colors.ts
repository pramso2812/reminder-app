/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    background: "#F9FAFB",
    text: "#1F2937", // Slate
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: "#4F46E5", // Indigo
    secondary: "#FACC15", // Yellow
    success: "#10B981", // Green
    error: "#EF4444", // Red
    placeholder: "#C1C1C4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primary: "#4F46E5", // Indigo
    secondary: "#FACC15", // Yellow
    success: "#10B981", // Green
    error: "#EF4444", // Red
    placeholder: "#55565A",
  },
};
