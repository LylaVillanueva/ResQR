import React from 'react';
import SharedConfirmationScreen from "../ConfirmationScreen";

const NOT_SAFE_BULLETS = [
  'This will immediately escalate the alert to high priority.',
  'The guardian and barangay will be notified right away.',
  'You can still flip this back to Safe later if the situation improves.',
];

export default function ConfirmationScreen(props) {
  return <SharedConfirmationScreen {...props} role="responder" notSafeBullets={NOT_SAFE_BULLETS} />;
}
