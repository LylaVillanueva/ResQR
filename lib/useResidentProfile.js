import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from "./api";
import { mapResident, mapIncident } from "./models";

export default function useResidentProfile(route) {
  const id = route.params?.residentId || route.params?.resident?.id;
  const [resident, setResident] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeRef = useRef(false);

  const load = useCallback((withSpinner) => {
    if (!id) { setError('No resident selected.'); setLoading(false); return Promise.resolve(); }
    if (withSpinner) setLoading(true);
    setError(null);
    return Promise.all([api.getResident(id), api.listResidentHistory(id)])
      .then(([row, history]) => {
        if (!activeRef.current) return;
        const profile = mapResident(row);
        setResident(profile);
        setAlerts(history.map((item) => mapIncident(item, [profile])));
      })
      .catch((err) => { if (activeRef.current) setError(err.message); })
      .finally(() => { if (activeRef.current) setLoading(false); });
  }, [id]);

  useFocusEffect(useCallback(() => {
    activeRef.current = true;
    setResident(null);
    setAlerts([]);
    load(true);
    return () => { activeRef.current = false; };
  }, [load]));

  return { resident, setResident, alerts, loading, error, refresh: () => load(false) };
}
