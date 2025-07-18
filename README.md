# 🧠 Reminder App

**Reminder App** is a simple yet powerful mobile application built with **React Native** and **Expo**, designed to help users create, manage, and receive notifications for their important tasks or activities.

---

## 🚀 Features

- 📋 Create reminders with title, date, and time
- ⏰ Receive scheduled push notifications
- 🧠 Store data securely with Supabase backend
- 📱 Clean and responsive UI built with Figma design
- ✅ Supports Android (APK-ready)

---

## 🛠️ Tech Stack

- **Frontend:** Expo + React Native (TypeScript)
- **Backend:** Supabase (Database + Auth)
- **Notifications:** Expo Push Notifications
- **Design:** Figma

---

## 📊 System Flow & Database Design

See the system architecture and database schema (ER Diagram) here:

- 📄 [System Flow + ER Diagram (PDF)](./reminder-system-flow-er-diagram.pdf)

> ✅ Make sure the PDF file is uploaded to the repo or replace the path above accordingly.

---

## 🔗 Project URLs

- 🌐 **Supabase Project URL:** [https://supabase.com/dashboard/project/njcecwllmoyytvlvybjj](https://supabase.com/dashboard/project/njcecwllmoyytvlvybjj)
- 🎨 **Figma Design:** [https://www.figma.com/design/kScqYpSSJF7qdH3Q6pa8ve/Reminder-App?node-id=0-1&t=fdOdVuh1I9d5AvZf-1](https://www.figma.com/design/kScqYpSSJF7qdH3Q6pa8ve/Reminder-App?node-id=0-1&t=fdOdVuh1I9d5AvZf-1)

---

## 🧪 Getting Started

```bash
# 1. Clone this repo
git clone [https://github.com/your-username/reminder-app.git](https://github.com/pramso2812/reminder-app.git)
cd reminder-app

# 2. Install dependencies
yarn install

# 3. Add your environment variables
cp .env.example .env
# Fill in:
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Run the app
npx expo start
