import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';

const ZOOM = { latitudeDelta: 0.005, longitudeDelta: 0.005 };

// In-app map for an incident. While a bystander shares their live location,
// the alert data refreshes in the background and this map follows the new
// position on its own; the original scan spot stays pinned for reference.
export default function LiveLocationMap({ alert }) {
  const mapRef = useRef(null);
  const { mapLatitude: latitude, mapLongitude: longitude } = alert;
  const hasLive = alert.live_latitude != null && alert.live_longitude != null;
  const hasScan = alert.scan_latitude != null && alert.scan_longitude != null;
  const sharing = hasLive && alert.live_location_sharing;

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    mapRef.current?.animateToRegion({ latitude, longitude, ...ZOOM }, 600);
  }, [latitude, longitude]);

  if (latitude == null || longitude == null) return null;

  return (
    <View>
      <View style={styles.wrap}>
        <MapView ref={mapRef} style={styles.map} initialRegion={{ latitude, longitude, ...ZOOM }}>
          {hasScan && (
            <Marker
              coordinate={{ latitude: alert.scan_latitude, longitude: alert.scan_longitude }}
              title="QR scanned here"
              description={alert.location}
              pinColor={SCAN_PIN}
            />
          )}
          {hasLive && (
            <Marker
              coordinate={{ latitude: alert.live_latitude, longitude: alert.live_longitude }}
              title={sharing ? 'Bystander is here now' : 'Bystander last seen here'}
              description={alert.liveAddress}
              pinColor={LIVE_PIN}
            />
          )}
        </MapView>
        {hasLive && (
          <View style={styles.badge}>
            <View style={[styles.dot, !sharing && styles.dotStopped]} />
            <Text style={styles.badgeText}>{sharing ? 'LIVE' : 'Sharing stopped'}</Text>
          </View>
        )}
      </View>

      <View style={styles.legend}>
        {hasLive && (
          <LegendRow color={LIVE_PIN} label={sharing ? 'Red pin: where the bystander is now' : 'Red pin: where the bystander was last seen'} />
        )}
        {hasScan && <LegendRow color={SCAN_PIN} label="Blue pin: where the QR code was scanned" />}
        {hasLive && (
          <View style={styles.legendRow}>
            <View style={styles.legendBadge}>
              <View style={[styles.dot, !sharing && styles.dotStopped]} />
              <Text style={styles.legendBadgeText}>{sharing ? 'LIVE' : 'Stopped'}</Text>
            </View>
            <Text style={styles.legendText}>
              {sharing ? 'The bystander is sharing their location; the map follows them.' : 'The bystander stopped sharing their location.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function LegendRow({ color, label }) {
  return (
    <View style={styles.legendRow}>
      <FontAwesome5 name="map-marker-alt" size={16} color={color} style={styles.legendPin} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const LIVE_PIN = colors.primaryBright;
const SCAN_PIN = colors.secondary;

const styles = StyleSheet.create({
  wrap: { marginTop: 12, height: 200, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { flex: 1 },
  badge: {
    position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surface,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success.ink, marginRight: 6 },
  dotStopped: { backgroundColor: colors.textMuted },
  badgeText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: colors.ink },
  legend: { marginTop: 10, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendPin: { width: 18, textAlign: 'center', marginRight: 8 },
  legendText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  legendBadge: {
    flexDirection: 'row', alignItems: 'center', marginRight: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
  },
  legendBadgeText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: colors.ink },
});
