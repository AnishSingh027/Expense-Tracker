# 📱 TrackWise — Premium Mobile Expense Tracker

TrackWise is a state-of-the-art, premium personal finance and expense tracking mobile application built with **React Native**, **Expo**, and **SQLite**. Designed with modern aesthetics, smooth micro-animations, and robust security, it helps users manage their daily expenses, track budgets, visualize analytics, and secure their financial records with on-device biometrics and custom passcodes.

---

## ✨ Key Features

- **📊 Modern Dashboard**: Real-time tracking of total balance, monthly income, and expenditures with dynamic progress bars indicating spent limits.
- **🔒 Dual-Layer Security**: 
  - **Custom Passcode Lock**: Reusable 4-digit PIN setup to protect financial data on startup.
  - **Biometric Unlock**: Integrated fingerprint scanning (Touch ID) and Face ID support using `expo-local-authentication`.
- **💸 Category Tracking**: Categorize income and expenses (Food, Shopping, Entertainment, Travel, Health, etc.) with custom tags and emojis.
- **📈 Comprehensive Analytics**: Detailed monthly spending breakdowns, visualizations, and logs.
- **💾 Offline-First Architecture**: Powered by a local **SQLite** database for lightning-fast performance, offline data safety, and zero external backend reliance.
- **🎨 Premium Dark & Light Themes**: Harmonious, curated color palettes dynamically toggled through settings.

---

## 🛠️ Technology Stack

- **Framework**: [Expo (SDK 56)](https://expo.dev/) & [React Native](https://reactnative.dev/)
- **Navigation**: [Expo Router v3](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Security**: [Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) (Biometrics)
- **Styling**: Pure CSS / StyleSheet API using a cohesive Design Token System
- **Icons**: [@expo/vector-icons (Ionicons)](https://icons.expo.fyi/)
- **Runtime Layouts & Utilities**: React Native Safe Area Context, Reanimated

---

## 🗄️ Database Architecture

TrackWise uses a local SQLite database (`expense.db`) containing three tables. The schemas are structured as follows:

### 1. `transactions`
Stores individual log items of income and expenses.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique transaction identifier |
| `title` | `TEXT` | Title or merchant name |
| `amount` | `REAL` | Currency value of transaction |
| `type` | `TEXT` | `income` or `expense` |
| `category` | `TEXT` | Category name (e.g., Food, Travel) |
| `note` | `TEXT` | User notes or description |
| `date` | `TEXT` | ISO date string (`YYYY-MM-DD`) |
| `time` | `TEXT` | ISO time string (`HH:MM`) |
| `emoji` | `TEXT` | Visual category indicator emoji |

### 2. `budgets`
Tracks budget thresholds configured per month.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique budget identifier |
| `amount` | `REAL` | Total budget limit for the month |
| `month` | `INTEGER` | Calendar month index (1-12) |
| `year` | `INTEGER` | Calendar year |

### 3. `settings`
Stores persistent device settings and preferences.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique settings identifier |
| `theme` | `TEXT` | Preferred theme: `light` or `dark` |
| `biometric` | `TEXT` | Enabled biometrics status: `"true"` or `"false"` |
| `passcode` | `TEXT` | Hashed or plaintext 4-digit PIN |
| `passcodeEnabled` | `TEXT` | Enabled PIN lock status: `"true"` or `"false"` |

---

## 📂 Project Structure

```bash
expense-tracker/
├── assets/                  # App icon, splash-screen assets, etc.
├── src/
│   ├── app/                 # Expo Router file-based pages
│   │   ├── (tabs)/          # Tabs navigation (Dashboard, Activity, Add, Analytics, Settings)
│   │   └── _layout.tsx      # Entry stack layout provider
│   ├── components/          # Shared components (e.g. LockScreen)
│   ├── context/             # React Context for global state (TransactionContext)
│   ├── database/            # SQLite schema initialization and connection management
│   ├── services/            # SQLite database services (query, write, delete)
│   ├── styles/              # Global theme sheets, color palettes, and global layouts
│   └── utils/               # Biometrics helper utilities
├── app.json                 # Expo config plugin list, bundle IDs, and iOS/Android permissions
├── package.json             # NPM dependencies & scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

To get a local development environment up and running on your physical phone or simulator, follow these steps:

### Prerequisites

- Node.js (v18 or higher recommended)
- [Expo Go App](https://expo.dev/client) installed on your iOS or Android physical device, OR setup with Xcode Simulator (macOS) / Android Studio Emulator (Windows/Linux).

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   cd expense-tracker
   ```

2. Install the application dependencies:
   ```bash
   npm install
   ```

### Running the App

- **Start Expo Server**:
  ```bash
  npm run start
  ```
  *Scan the QR code displayed in your terminal using the Expo Go app to launch the app instantly.*

- **Run on Android Emulator**:
  ```bash
  npm run android
  ```

- **Run on iOS Simulator**:
  ```bash
  npm run ios
  ```

- **Run on Web**:
  ```bash
  npm run web
  ```

---

## 🔐 Biometric Lock Setup & Configuration

TrackWise utilizes hardware security features of modern devices via the `expo-local-authentication` plugin.

### Setup on iOS (Face ID)
To run Face ID/biometric unlock on iPhones, the application is configured in `app.json` with the required system permission string:
```json
"plugins": [
  [
    "expo-local-authentication",
    {
      "faceIDPermission": "Allow TrackWise to use Face ID for authentication."
    }
  ]
]
```

### Flow & Passcode Fallback
1. Secure the app by going to **Settings ⚙️** -> **Passcode Lock** and toggling it ON.
2. Define a **4-digit PIN passcode**.
3. Toggle **Biometric Unlock** to enable fingerprint/face scanning.
4. When launching the app, the system triggers the biometric modal. If the biometric scan fails or is canceled, users can seamlessly enter their PIN passcode as a fallback.
