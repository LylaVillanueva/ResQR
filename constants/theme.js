// Shared visual language for every role: light surfaces, blue brand accents, red only for urgency.

// Approved QRAlalay palette. Every screen takes its colors from `colors` below;
// add new colors here rather than as literals in a screen.
export const palette = {
  PRIMARY: '#176B87',
  ALERT: '#E94F50',
  WARNING: '#F4C430',
  SUCCESS: '#2E9B70',
  BACKGROUND: '#F5F7FA',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#243442',
  TEXT_SECONDARY: '#64748B',
  BORDER: '#E2E8F0',
};

// Roles: blue = brand and navigation; red = urgent assistance, escalation and
// destructive actions; yellow = pending and warnings; green = verified, safe
// and successful. The *Ink variants are darker shades for text and filled
// buttons, because the base red, green and yellow are below 4.5:1 contrast
// for normal-size text on white.
export const colors = {
  primary: palette.PRIMARY,        // 6.0:1 on white
  primaryDark: '#0F4F66',
  primarySoft: '#E3F1F6',          // primary text on it: 5.2:1
  primaryBorder: '#B9DCE8',
  primaryBright: palette.PRIMARY,  // kept for existing references
  secondary: palette.PRIMARY,      // kept for existing references
  onPrimary: '#FFFFFF',

  alert: palette.ALERT,            // icons, borders, accents
  alertInk: '#B42B2C',             // text and filled destructive buttons: 6.3:1 on white
  alertSoft: '#FDE8E8',
  alertBorder: '#F5C2C2',

  warning: palette.WARNING,        // fills with dark text only
  warningInk: '#7A5A00',           // 5.7:1 on warningSoft
  warningSoft: '#FDF3CF',

  successBase: palette.SUCCESS,    // icons, borders, accents
  successInk: '#1E7353',           // 5.8:1 on white
  successSoft: '#DDF3EA',

  background: palette.BACKGROUND,
  surface: palette.SURFACE,
  surfaceSunken: '#F8FAFC',        // input fill

  ink: palette.TEXT_PRIMARY,
  textPrimary: palette.TEXT_PRIMARY,
  textSecondary: palette.TEXT_SECONDARY, // 4.8:1 on white
  textMuted: '#94A3B8',            // decorative icons, chevrons, disabled
  textFaint: palette.TEXT_SECONDARY,
  textPlaceholder: palette.TEXT_SECONDARY,

  border: palette.BORDER,
  borderStrong: '#CBD5E1',         // input outlines
  borderSoft: '#EEF2F6',
  overlay: 'rgba(15,23,42,0.45)',
  shadow: '#0F172A',

  // Status groups (text + background), used by status pills and badges.
  danger: { ink: '#B42B2C', bg: '#FDE8E8' },
  pending: { ink: '#7A5A00', bg: '#FDF3CF' },
  success: { ink: '#1E7353', bg: '#DDF3EA', soft: '#DDF3EA' },
  info: { ink: palette.PRIMARY, bg: '#E3F1F6' },

  dangerSurface: '#FDE8E8',        // light red fill for destructive buttons
};

// Keep elevation subtle so content and controls lead the page.
export const shadow = {
  card: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  soft: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
};

// Logical pixels: readable at the default size, with optional larger text in Settings.
export const typography = { title: 32, section: 24, body: 18, detail: 16, caption: 14 };
export const spacing = { screen: 24, section: 24, field: 24, card: 16, control: 56 };

export const radius = { sm: 8, md: 10, lg: 12, pill: 100 };

// Form controls follow the enrollment reference.
export const field = {
  labelSize: typography.body,
  labelColor: colors.textSecondary,
  inputBg: colors.surfaceSunken,
  inputBorder: colors.borderStrong,
};

export const font = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Maps a backend-ish status string to the semantic color group above —
// the same status→color logic was duplicated with the same hex values in
// ~8 places; this is the one place it should live.
export function statusTone(status) {
  if (status === 'closed' || status === 'Safe') return colors.success;
  if (status === 'escalated' || status === 'open' || status === 'Not Safe') return colors.danger;
  return colors.pending;
}

// Neutral structure keeps attention on the colored confirmation actions.
export const alertLayout = {
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, shadowOpacity: 0, elevation: 0 },
  location: { backgroundColor: colors.surfaceSunken, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  details: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, minHeight: 48, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
};
