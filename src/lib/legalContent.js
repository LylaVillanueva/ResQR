// Real, substantive policy text reflecting what this app actually does today
// (see the data flows in src/lib/api.js and RESQR2's services) — not the
// placeholder "content goes here" stub it replaces. The bracketed fields are
// intentionally unfilled: a barangay office/organization name, DPO contact,
// and legal review are still needed before this is final. Update
// EFFECTIVE_DATE whenever the text below changes.

export const EFFECTIVE_DATE = 'Not yet published';
export const ORGANIZATION_NAME = '[Barangay / Organization Name]';
export const PRIVACY_CONTACT_EMAIL = '[privacy contact email]';

export const PRIVACY_POLICY = [
  {
    heading: 'Who this covers',
    body:
      `QRAlalay is operated by ${ORGANIZATION_NAME} for barangay emergency response. This policy covers barangay officials, ` +
      'guardians, barangay responders, and members of the public who scan a resident’s QR code. Accounts are provisioned by ' +
      'barangay staff — there is no public sign-up.',
  },
  {
    heading: 'What we collect',
    body:
      'Account holders: full name, phone number or email (used to sign in with a one-time code), and role. ' +
      'Residents (entered by barangay staff): full name, birth date, home address, a photo, medical notes, and whether the ' +
      'resident is a senior citizen or person with disability — this last category is treated as sensitive personal ' +
      'information under the Data Privacy Act and is only entered by barangay staff, never by the public. Guardian records ' +
      'also include an emergency contact’s name, relationship, and phone number. When someone scans a resident’s QR code ' +
      'to raise an alert, we record the scan’s GPS coordinates (if location access is granted) and any note the scanner adds.',
  },
  {
    heading: 'How it’s used',
    body:
      'Solely to run the emergency-alert workflow: notifying a resident’s guardian and barangay staff when a QR code is ' +
      'scanned, coordinating a responder, and keeping an audit trail of that response. We do not use this data for ' +
      'advertising, and we do not sell it.',
  },
  {
    heading: 'Who we share it with',
    body:
      'Supabase hosts our database and file storage (resident photos, printed QR assets). Resend delivers the email login ' +
      'code. Expo’s push notification service delivers alerts to guardians’, officials’, and responders’ devices. ' +
      'None of these providers may use the data for their own purposes — they process it only to provide the service ' +
      'above. We do not share resident data with any other third party.',
  },
  {
    heading: 'What an anonymous scanner sees',
    body:
      'Scanning a resident’s QR code, with no account needed, shows that resident’s name, category (e.g. senior citizen), ' +
      'and emergency contact details, so a bystander can help or notify someone — that is the QR code’s purpose. It does ' +
      'not show medical notes or home address.',
  },
  {
    heading: 'How long we keep it',
    body:
      'Account and resident records are kept for as long as the account is active with the barangay. Incident and scan ' +
      'history is kept as part of the barangay’s response record. We are working on formal retention limits for older ' +
      'records; this section will be updated once those are in place.',
  },
  {
    heading: 'Your rights',
    body:
      'Under the Data Privacy Act of 2012 (RA 10173), you may ask to access, correct, or request deletion of your personal ' +
      `data by contacting ${PRIVACY_CONTACT_EMAIL}. Because resident records are entered and managed by barangay staff, a ` +
      'guardian or resident should first raise a correction request with their barangay office.',
  },
  {
    heading: 'Security',
    body:
      'Login uses a one-time code sent to your email or phone rather than a stored password. Access to resident data is ' +
      'restricted by role — officials, guardians, and responders each see only what their role needs.',
  },
];

export const TERMS_OF_SERVICE = [
  {
    heading: 'Accounts',
    body:
      'QRAlalay accounts are created by barangay staff for verified officials, guardians, and responders. You’re ' +
      'responsible for keeping the device you sign in with secure, and for the accuracy of information you submit through ' +
      'your account.',
  },
  {
    heading: 'Not a replacement for emergency services',
    body:
      'QRAlalay helps coordinate a barangay-level response. It is not a substitute for calling 911 or your local emergency ' +
      'hotline directly, and alert delivery depends on network connectivity, device settings, and notification permissions ' +
      '— in a life-threatening situation, always contact emergency services first.',
  },
  {
    heading: 'Acceptable use',
    body:
      'Use the app only for its intended purpose: enrolling and monitoring residents, and responding to genuine QR-code ' +
      'scans. Submitting false alerts, or accessing resident data outside your role’s responsibilities, may result in your ' +
      'account being deactivated by your barangay office.',
  },
  {
    heading: 'Service availability',
    body:
      'We aim to keep the app available, but it may be interrupted for maintenance or by factors outside our control ' +
      '(network outages, third-party service downtime). We’ll work to restore service as quickly as possible.',
  },
  {
    heading: 'Changes to these terms',
    body:
      'If these terms change in a way that affects how your data is used, we’ll update this screen and the effective ' +
      'date below.',
  },
  {
    heading: 'Contact',
    body: `Questions about these terms can be sent to ${PRIVACY_CONTACT_EMAIL}.`,
  },
];
