import React from 'react';
import SharedConfirmationScreen from "../ConfirmationScreen";

const NOT_SAFE_BULLETS = [
  'This will escalate the alert because your ward may still need assistance.',
  'The barangay response team can use this status to prioritize the incident.',
  'If the situation improves, you can submit a new Safe confirmation.',
];

export default function ConfirmationScreen(props) {
  return <SharedConfirmationScreen {...props} role="guardian" notSafeBullets={NOT_SAFE_BULLETS} />;
}
