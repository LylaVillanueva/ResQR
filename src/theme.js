// Shared visual language for every role: white surfaces, red accents, and generous spacing.

export const colors = {
  primary: '#a83232',
  primaryBright: '#c12b2b',
  secondary: '#245490',

  ink: '#1a1a1a',
  textPrimary: '#333',
  textSecondary: '#666',
  textMuted: '#777',
  textFaint: '#666',
  textPlaceholder: '#737373',

  border: '#ddd',
  borderSoft: '#eee',
  surface: '#fff',
  surfaceSunken: '#f2f2f2',

  danger: { ink: '#a83232', bg: '#fbd1d1' },
  pending: { ink: '#8a6d1d', bg: '#fbf1a1' },
  success: { ink: '#288928', bg: '#a1fbaa', soft: '#e8f8ea' },
  info: { ink: '#245490', bg: '#d3e5f8' },

  dangerSurface: '#ffdcdc', // buttons/surfaces that need a light-red fill (logout, QR issue, search bar)
};

// Keep elevation subtle so content and controls lead the page.
export const shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  soft: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
};

// Logical pixels: readable at the default size, with optional larger text in Settings.
export const typography = { title: 28, section: 22, body: 18, detail: 16, caption: 14 };
export const spacing = { screen: 24, section: 24, field: 24, card: 16, control: 56 };

export const radius = { sm: 8, md: 10, lg: 12, pill: 100 };

// Form controls follow the enrollment reference.
export const field = {
  labelSize: typography.body,
  labelColor: colors.textSecondary,
  inputBg: colors.surfaceSunken,
  inputBorder: '#ccc',
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
  card: { backgroundColor: colors.surface, borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 12, padding: 16, shadowOpacity: 0, elevation: 0 },
  location: { backgroundColor: '#f7f7f8', borderColor: '#ededee', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  details: { backgroundColor: colors.surface, borderColor: '#d7e1ec', borderWidth: 1, borderRadius: 8, minHeight: 48, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
};
