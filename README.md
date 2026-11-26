# QRAlalay Mobile

Expo SDK 57 / React Native app for barangay officials, guardians and responders.
It signs in with email one-time codes and reads and writes data through the
hosted Supabase project (Project B) using its database functions and Edge
Functions. The public bystander page is a separate app (`../QRAlalay-Web`,
published at https://www.qralalay.app).

## Run on a phone

Requires Node.js 22.13 or newer and **Expo Go for SDK 57** on the phone (the
Play Store version may be newer; install the SDK 57 build from
https://expo.dev/go?sdkVersion=57&platform=android&device=true).

```sh
npm install
npx expo start --lan
```

In Expo Go choose **Enter URL manually** and open `exp://<this Mac's LAN IP>:8081`
(both devices on the same Wi-Fi). If the network blocks device-to-device
traffic, use `npx expo start --tunnel`.

Local configuration lives in `.env` (ignored by Git; see `.env.example`):

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
EXPO_PUBLIC_BACKEND_MODE=supabase
```

Only the publishable key belongs here; Expo puts `EXPO_PUBLIC_*` values into
the app bundle. Without `EXPO_PUBLIC_BACKEND_MODE=supabase` the app uses the
legacy Express API at `EXPO_PUBLIC_API_BASE_URL`, which is kept until its
retirement is approved.

## Folder structure

```text
App.js, index.js       Expo entry, fonts and providers
assets/                Icons and images used by app.json and screens
components/            Shared UI: AppText, AppTextInput, Avatar, ScreenState, ui, LiveLocationMap
  modals/              AppModal (base dialog), InfoModal, IncidentLogModal, ReasonPromptModal
  tabs/                Tab bars for each role
constants/             theme.js (palette, type, spacing), translations, legal text, audit types
contexts/              AppDataContext (live data and actions), AccessibilitySettingsContext
hooks/                 useSession, useResidentProfile, useNotificationPrefs
navigation/            AppNavigator and the per-role screen registry
screens/
  auth/                Start, sign-in and permissions
  official/            Barangay official dashboard, residents, users, alerts, QR cards
  guardian/            Wards, alerts, safety observations, emergency help
  responder/           Assignments, safety observations, incident reports
  shared/              Scanner, confirmation, legal, accessibility, public emergency help, public scan page
services/              Backend and device communication: api (backend switch), supabaseApi,
                       supabase client, appData, sessions, notifications, push, QR PDF export
utils/                 Record mappers (models), QR card HTML, photo picking
tests/                 Node test runner suites (no network)
```

Screens never call Supabase directly; they go through `services/api.js`.

## Colours

All colours come from `constants/theme.js`. The approved palette is exported
as `palette`; screens use the role-based `colors` tokens:

| Role | Token | Value |
|---|---|---|
| Brand, navigation | `colors.primary` | `#176B87` |
| Urgent, escalation, destructive | `colors.alert` (icons, borders), `colors.alertInk` (text, filled buttons) | `#E94F50`, `#B42B2C` |
| Pending, warning | `colors.warning` (fills), `colors.warningInk` (text) | `#F4C430`, `#7A5A00` |
| Verified, safe, success | `colors.successBase`, `colors.successInk` | `#2E9B70`, `#1E7353` |
| Background, surface | `colors.background`, `colors.surface` | `#F5F7FA`, `#FFFFFF` |
| Text | `colors.textPrimary`, `colors.textSecondary` | `#243442`, `#64748B` |
| Borders | `colors.border` | `#E2E8F0` |

The `*Ink` shades exist because the base red, green and yellow are below the
4.5:1 contrast needed for normal-size text. Status pills always carry a text
label, so status never depends on colour alone. Add new colours to the theme
rather than as literals in a screen.

## Checks

```sh
npm test                 # unit and contract tests in tests/
npx expo install --check # SDK 57 dependency versions
```

Bundling and live behaviour (sign-in, QR issue/export, assistance workflow)
are verified on a phone through Expo Go.

## Notifications

Expo Go and web skip the native push module, and the push toggle is hidden
there. Remote push needs a development build, an EAS project ID and push
credentials. In-app refresh and Realtime updates work in Expo Go.
