# METIO — AI Agent Management App

> "Your AI agents, your rules"

A comprehensive React Native Expo app for managing personal AI agents that automate your daily tasks.

![Metio](https://placeholder.com/metio-banner.png)

## 📱 Total Screens: 33

### Phase 1: Onboarding (5 screens)
| Screen | File | Description |
|--------|------|-------------|
| Splash | `SplashScreen.js` | Animated logo with TV robot mascot |
| Onboarding 1 | `OnboardingScreens.js` | Introduce AI agents concept |
| Onboarding 2 | `OnboardingScreens.js` | Show automation benefits |
| Onboarding 3 | `OnboardingScreens.js` | Emphasize user control |
| Login | `AuthScreens.js` | Email + social auth |

### Phase 2: Auth (2 screens)
| Screen | File | Description |
|--------|------|-------------|
| Sign Up | `AuthScreens.js` | Create new account |
| Forgot Password | `AuthScreens.js` | Password reset flow |

### Phase 3: Main Navigation (4 screens)
| Screen | File | Description |
|--------|------|-------------|
| Command Center | `HomeScreen.js` | Dashboard with metrics, agents, pending approvals |
| Agents List | `AgentScreens.js` | All 5 agents with status |
| Chat Interface | `ChatScreen.js` | Type/speak commands to agents |
| Settings | `SettingsScreens.js` | Preferences, connections, account |

### Phase 4: Agent Interaction (4 screens)
| Screen | File | Description |
|--------|------|-------------|
| Agent Detail | `AgentScreens.js` | View/configure individual agent |
| Draft Approval | `DraftApprovalScreen.js` | Review/edit/approve AI drafts |
| Activity | `OtherScreens.js` | All agent activity history |
| Voice Command | Modal in `HomeScreen.js` | Voice input with suggestions |

### Phase 5: Agent Setup Wizard (4 screens)
| Screen | File | Description |
|--------|------|-------------|
| Step 1: Select Type | `AgentSetupScreens.js` | Choose from 5 agent types |
| Step 2: Connect | `AgentSetupScreens.js` | OAuth to services |
| Step 3: Configure | `AgentSetupScreens.js` | Toggle features, set times |
| Step 4: Deploy | `AgentSetupScreens.js` | Success screen |

### Phase 6: Feature Outputs (10 screens)
| Agent | Screen | File | Description |
|-------|--------|------|-------------|
| 📧 Comm Manager | Email Digest | `CommMoneyFeatures.js` | Daily email summary |
| 📧 Comm Manager | Priority Inbox | `CommMoneyFeatures.js` | Auto-sorted emails |
| 💰 Money Bot | Statement Scanner | `CommMoneyFeatures.js` | Expense tracking |
| 💰 Money Bot | Spend Alert | `CommMoneyFeatures.js` | Budget warnings |
| 📅 Life Planner | Smart Scheduling | `LifeSocialHomeFeatures.js` | AI calendar booking |
| 📅 Life Planner | Morning Briefing | `LifeSocialHomeFeatures.js` | Daily overview |
| 📱 Social Pilot | News Brief | `LifeSocialHomeFeatures.js` | Curated news |
| 📱 Social Pilot | Mention Alerts | `LifeSocialHomeFeatures.js` | Social mentions |
| 🏠 Home Command | Voice Routines | `LifeSocialHomeFeatures.js` | Smart home triggers |
| 🏠 Home Command | Away Detection | `LifeSocialHomeFeatures.js` | Geofence automation |

### Phase 7: Settings (2 screens)
| Screen | File | Description |
|--------|------|-------------|
| Profile Edit | `SettingsScreens.js` | Update name, email, photo |
| Help & FAQ | `SettingsScreens.js` | FAQ accordion + help links |

### Phase 8: System States (2 screens)
| Screen | File | Description |
|--------|------|-------------|
| Empty States | `OtherScreens.js` | No agents, no activity |
| Error States | `OtherScreens.js` | Network error, general error |

### Phase 9: Permissions (1 screen)
| Screen | File | Description |
|--------|------|-------------|
| Notification Permission | `OtherScreens.js` | Push notification request |

---

## 🎨 Design System

### Colors
```javascript
orange: '#F26F21'     // Primary
lavender: '#938EF2'   // AI/Secondary
gray: '#D9D9D9'       // Background
black: '#080808'      // Dark/Text
white: '#FFFFFF'      // Light
success: '#22C55E'    // Active
warning: '#F59E0B'    // Paused
error: '#EF4444'      // Alert
```

### Typography
- **Headings**: System Bold (900 weight)
- **Body**: System Regular (400-600 weight)

### Components
- Button (primary, secondary, orange, ghost)
- Card (default, selected, lavender, outlined)
- Header (orange, gray, black variants)
- Badge (active, paused, ai, urgent, etc.)
- Input, Toggle, ToggleRow
- MetricCard, MetricsRow
- AgentCard, AgentGridCard
- NotificationCard, ListItem
- AlertBanner, ProgressSteps

---

## 📁 Project Structure

```
metio-app/
├── App.js                    # Entry point
├── app.json                  # Expo config
├── package.json              # Dependencies
├── babel.config.js           # Babel config
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── index.js
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Header.js
│   │   ├── Badge.js
│   │   ├── Avatar.js
│   │   ├── FormComponents.js
│   │   ├── AgentComponents.js
│   │   └── ListComponents.js
│   ├── constants/
│   │   └── theme.js          # Colors, fonts, sizes
│   ├── navigation/
│   │   └── AppNavigator.js   # React Navigation setup
│   └── screens/
│       ├── onboarding/
│       │   ├── SplashScreen.js
│       │   └── OnboardingScreens.js
│       ├── auth/
│       │   └── AuthScreens.js
│       ├── main/
│       │   ├── HomeScreen.js
│       │   ├── ChatScreen.js
│       │   └── OtherScreens.js
│       ├── agents/
│       │   ├── AgentScreens.js
│       │   └── DraftApprovalScreen.js
│       ├── features/
│       │   ├── CommMoneyFeatures.js
│       │   └── LifeSocialHomeFeatures.js
│       ├── settings/
│       │   └── SettingsScreens.js
│       └── setup/
│           └── AgentSetupScreens.js
└── assets/                   # Images, fonts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation
```bash
# Clone the project
cd metio-app

# Install dependencies
npm install

# Start Expo
npx expo start
```

### Running on Device
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Physical Device**: Scan QR code with Expo Go app

---

## 📦 Dependencies

```json
{
  "expo": "~50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.2",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "react-native-screens": "~3.29.0",
  "react-native-safe-area-context": "4.8.2",
  "@expo/vector-icons": "^14.0.0",
  "expo-linear-gradient": "~12.7.0",
  "react-native-reanimated": "~3.6.1",
  "react-native-gesture-handler": "~2.14.0"
}
```

---

## 🔄 User Flow

```
Splash
  ↓
Onboarding (3 screens)
  ↓
Login / Sign Up ←→ Forgot Password
  ↓
[Notification Permission]
  ↓
Command Center (Home)
  ↓
┌─────────────────────────────────────────┐
│  Home  │  Agents  │  Chat  │  Settings  │
│   ↓         ↓         ↓          ↓      │
│ Metrics  Agent List  Voice    Profile   │
│ Agents   Agent Detail  ↓      Help/FAQ  │
│ Pending  Setup Flow  Commands  Connected │
│   ↓         ↓         ↓          ↓      │
│ Feature  Feature   Response   Logout    │
│ Outputs  Outputs              │
└─────────────────────────────────────────┘
```

---

## 🛡️ Security & Privacy

- OAuth 2.0 for third-party connections
- No email content stored - metadata only
- End-to-end encryption for sensitive data
- User approval required for all agent actions

---

## 📄 License

MIT © 2026 Metio

---

Built with ❤️ using React Native & Expo
