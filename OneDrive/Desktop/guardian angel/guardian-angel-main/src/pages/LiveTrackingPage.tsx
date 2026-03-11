import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

const LiveTrackingPage = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alertId) return;

    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, latitude, longitude, created_at")
        .eq("alert_id", alertId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error) {
        setLocation(data ?? null);
      }

      setLoading(false);
    };

    // Initial fetch
    fetchLatest();

    // Poll every 5 seconds
    const interval = setInterval(fetchLatest, 5000);

    return () => clearInterval(interval);
  }, [alertId]);

  if (!alertId) {
    return <div className="p-4">Invalid alert ID</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/history">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Tracking</h1>
          <p className="text-xs text-muted-foreground font-mono">
            Alert: {alertId.slice(0, 8)}...
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Fetching location...
            </span>
          </CardContent>
        </Card>
      ) : !location ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No location data available for this alert.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Latitude
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {location.latitude.toFixed(6)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Longitude
                  </p>
                  <p className="font-mono font-semibold text-foreground">
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Last updated:{" "}
                  {location.created_at
                    ? format(
                        new Date(location.created_at),
                        "MMM d, yyyy h:mm:ss a"
                      )
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <iframe
              title="Live Location Map"
              width="100%"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&output=embed`}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default LiveTrackingPage;