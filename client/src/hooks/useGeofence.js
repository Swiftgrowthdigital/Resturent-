import { useEffect, useState } from 'react';
import { calculateDistanceMeters } from '../lib/geo';

export function useGeofence(settings) {
  const [status, setStatus] = useState({
    loading: true,
    allowed: false,
    message: 'Requesting location permission...'
  });

  useEffect(() => {
    let active = true;
    if (!settings) {
      setStatus({ loading: false, allowed: false, message: 'Restaurant settings unavailable.' });
      return;
    }

    if (!navigator.geolocation) {
      setStatus({ loading: false, allowed: false, message: 'Geolocation is not supported.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        const distance = calculateDistanceMeters(
          settings.latitude,
          settings.longitude,
          position.coords.latitude,
          position.coords.longitude
        );
        const allowed = distance <= settings.radiusMeters;
        setStatus({
          loading: false,
          allowed,
          message: allowed
            ? 'You are inside the restaurant radius.'
            : 'You are outside the restaurant. Online ordering is disabled.'
        });
      },
      () => {
        if (!active) return;
        setStatus({
          loading: false,
          allowed: false,
          message: 'Location permission is required to place an order.'
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      active = false;
    };
  }, [settings]);

  return status;
}
