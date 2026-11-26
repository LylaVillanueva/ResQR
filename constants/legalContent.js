// Real, substantive policy text reflecting what this app actually does today
// (see the data flows in services/api.js and the QRAlalay-Backend services) — not the
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
      'Account holders: full name, phone number or email (used as a login identifier), and role. ' +
      'Residents (entered by barangay staff): full name, birth date, home address, medical notes, and whether the ' +
      'resident is a senior citizen or person with disability — this last category is treated as sensitive personal ' +
      'information under the Data Privacy Act and is only entered by barangay staff, never by the public. Guardian records ' +
      'also include an emergency contact’s name, relationship, and phone number. When someone scans a resident’s QR code ' +
      'to raise an alert, we record available device coordinates, any note the scanner adds, the request IP address, and browser or device information.',
  },
  {
    heading: 'How it’s used',
    body:
      'Solely to run the emergency-alert workflow: notifying a resident’s guardian and barangay staff when a QR code is ' +
      'used to submit an emergency alert, coordinating a responder, and keeping an audit trail of that response. We do not use this data for ' +
      'advertising, and we do not sell it.',
  },
  {
    heading: 'Who we share it with',
    body:
      'The backend uses a PostgreSQL database configured through Supabase infrastructure. Expo’s push notification service is used to send alerts to registered devices. ' +
      'The current demonstration login does not send email or SMS codes. Photo upload and QR file export are not implemented. ' +
      'Opening a map sends the selected coordinates to the external map service. Public QR information is accessible to anyone holding the active QR link.',
  },
  {
    heading: 'What an anonymous scanner sees',
    body:
      'The public QR response includes the resident’s first name, medical notes, and emergency contact names, relationships, and phone numbers. ' +
      'It does not include the home address or full resident record. Medical notes and contact details are sensitive; the public view is limited, not anonymous.',
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
      'The current prototype uses a fixed demonstration verification code and does not verify ownership of an email or phone number. It is not production authentication. Access to resident data is ' +
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

export const ABOUT_QRALALAY = [
  {
    heading: 'About',
    body:
      'QRAlalay is a barangay emergency response and resident safety system that uses QR-based identification ' +
      'and coordinated Guardian-Responder confirmation.',
  },
];
