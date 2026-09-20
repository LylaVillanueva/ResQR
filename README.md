# QRAlalay mobile

Expo 57 / React Native mobile application for barangay officials, guardians, and responders. The UI uses the existing RESQR2 backend; no sample accounts, incidents, or residents are injected into signed-in sessions.

## Run

Use Node.js 22.13 or newer, then:

```sh
npm install
npm start
```

Start an Android virtual device in Android Studio and run `npm run android`, or press `a` in the Expo terminal. Use an Expo Go build compatible with SDK 57, or a development build.

Keep local configuration in `.env` (ignored by Git):

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000/api
# Optional official contact number used by the emergency-help screen:
EXPO_PUBLIC_BARANGAY_PHONE=
```

The URL above is an example for an Android emulator connecting to a backend on the host Mac. Use the actual port and API URL for your backend. Existing Supabase configuration is preserved for code that imports the Supabase helper. Public Expo variables must not contain server secrets.

## Structure

```text
App.js                       Fonts and providers
component/                   Shared UI, role tabs, and AppNavigator
lib/                         API, data providers, hooks, and route registry
screens/                     Login, permissions, and shared screens
screens/admin/               Official dashboard and management screens
screens/guardian/            Ward, alert, and emergency-help screens
screens/responder/           Assignment, confirmation, and report screens
web/                         Public QR landing screen
assets/                      Existing images and icons
theme.js                     Shared fonts, colors, and spacing
*.test.cjs                   Data and notification regression tests
```

## Merge decisions

- Retains OTP login, secure native sessions, post-login permissions, existing enrollment/guardian registration, generated QR cards, and the QRAlalay branding/logo updates.
- Integrates incoming role dashboards, alert filters, user management layouts, ward views, emergency help, and responder incident/report screens.
- Uses backend user IDs to match wards and assignments. Backend incident status controls display categories; `confirmed_safe`, `resolved`, and `closed` remain in the Closed filter, matching the existing integration.
- Reloads shared data when screens gain focus, when the app becomes active, and every 15 seconds while active. Failed refreshes preserve the last loaded screen and display a retry message.
- Supports legacy resident-ID scan links and current `/scan/:token` links. Public previews use sanitized backend data; sending an emergency alert calls the scan-event endpoint.
- Only officials can issue QR cards. Issuing a new card replaces the previous token, so the profile action explicitly confirms that change.
- The incident report submits `finalActionSummary` to the existing resolve endpoint and marks the incident resolved. The form states this before submission.

## Shared interface

`theme.js` defines 28-point titles, 22-point section headings, 18-point body/field text, 24-point page and form spacing, and controls at least 56 points tall. White pages, light-gray fields, subtle borders, and red accents follow the enrollment reference. `component/ui.js`, `AppText`, `AppTextInput`, `AppPicker`, and `TabBar` share those styles across all roles. Text-size and font preferences persist in Accessibility settings; text line heights scale with the chosen size.

## Backend update

RESQR2 now exposes a barangay-scoped account directory and account create/edit/role/status endpoints. Account edits persist phone, email, and official position; new guardian accounts can save ward relationships. Access changes revoke sessions, and active wards/assignments must be reassigned before disabling their guardian/responder.

On an existing backend database, apply the additive schema update from `RESQR2` before using account management:

```sh
npm run migrate -- 004_account_management.sql
```

Restart the backend after updating its code. Guardian/responder profiles still direct users to the barangay for issued QR cards. QR file downloads and server synchronization of individual notification categories remain outside this update.

## Notifications

Expo Go and web preview skip loading the native push-notifications module. Remote push requires a development build, an EAS project ID, and platform push credentials. Notification preferences persist locally; supported native builds register their Expo token with the backend. Expo Go can be used to preview the rest of the interface without registering for remote push.

## Validation

```sh
npm test
npx expo install --check
npx expo export --platform android --output-dir /tmp/qralalay-android
```

The automated tests cover data mappings, role-specific reads, closed-alert history, real account creation payloads, and report persistence/error propagation. An export validates bundling, not end-to-end login, hardware permissions, or live emergency delivery; verify those with test accounts and an emulator/device.
