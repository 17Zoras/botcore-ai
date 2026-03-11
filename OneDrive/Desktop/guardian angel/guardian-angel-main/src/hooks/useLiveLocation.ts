import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const INTERVAL_MS = 5000;

interface UseLiveLocationReturn {
  isTracking: boolean;
  error: string | null;
  startTracking: (alertId: string) => void;
  stopTracking: () => void;
}

export const useLiveLocation = (): UseLiveLocationReturn => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertIdRef = useRef<string | null>(null);
  const latestPositionRef = useRef<GeolocationPosition | null>(null);

  const insertLocation = useCallback(
    async (position: GeolocationPosition) => {
      if (!user || !alertIdRef.current) {
        console.log("Missing user or alertId");
        return;
      }

      console.log("INSERTING LOCATION...");

      const { error: dbError } = await supabase.from("locations").insert({
        alert_id: alertIdRef.current,
        user_id: user.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (dbError) {
        console.error("Location insert error:", dbError.message);
      }
    },
    [user]
  );

  const stopTracking = useCallback(() => {
    console.log("Stopping tracking");

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    alertIdRef.current = null;
    latestPositionRef.current = null;
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(
    (alertId: string) => {
      console.log("startTracking called with:", alertId);

      if (watchIdRef.current !== null || intervalRef.current !== null) {
        console.log("Tracking already active");
        return;
      }

      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        toast.error("Geolocation not supported");
        return;
      }

      if (!user) {
        console.log("User not ready yet");
        return;
      }

      setError(null);
      alertIdRef.current = alertId;
      setIsTracking(true);

      // WATCH GPS
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          console.log("GPS UPDATE RECEIVED");
          latestPositionRef.current = position;

          // Insert immediately
          insertLocation(position);
        },
        (err) => {
          console.log("GPS ERROR:", err);
          setError(err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      // INSERT EVERY 5 SECONDS
      intervalRef.current = setInterval(() => {
        if (latestPositionRef.current) {
          insertLocation(latestPositionRef.current);
        } else {
          console.log("No GPS yet...");
        }
      }, INTERVAL_MS);
    },
    [insertLocation, user]
  );

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { isTracking, error, startTracking, stopTracking };
};