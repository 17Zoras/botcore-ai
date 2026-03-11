import { useState, useRef } from "react";
import SOSButton from "@/components/SOSButton";
import LocationDisplay from "@/components/LocationDisplay";
import EmergencyContacts from "@/components/EmergencyContacts";
import SafetyTips from "@/components/SafetyTips";
import QuickActions from "@/components/QuickActions";
import Layout from "@/components/Layout";
import { useAlerts } from "@/hooks/useAlerts";
import { useContacts } from "@/hooks/useContacts";
import { useNotifications } from "@/hooks/useNotifications";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import { toast } from "sonner";

const Index = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const activeAlertIdRef = useRef<string | null>(null);
  const { createAlert, updateAlert } = useAlerts();
  const { contacts } = useContacts();
  const { addNotification } = useNotifications();
  const { isTracking, startTracking, stopTracking } = useLiveLocation();

  const handleSOSActivate = async () => {
    if (isAlertActive) {
      // Resolve current alert and stop tracking
      if (activeAlertIdRef.current) {
        updateAlert.mutate({ id: activeAlertIdRef.current, status: "resolved" });
      }
      stopTracking();
      activeAlertIdRef.current = null;
      setIsAlertActive(false);
      toast.info("Alert resolved. Location tracking stopped.");
      return;
    }

    setIsAlertActive(true);

    // Get current location, create alert, then start live tracking
    try {
  const data = await createAlert.mutateAsync({
    contacts_notified: contacts.length,
    location_text: "Tracking live location...",
  });

  activeAlertIdRef.current = data.id;
  startTracking(data.id);

} catch (err) {
  console.error("Alert creation failed:", err);
}

    addNotification.mutate({
      type: "alert",
      title: "SOS Alert Sent",
      message: `Emergency alert sent to ${contacts.length} contacts with your location.`,
    });

    toast.success("🚨 Emergency alert sent!", {
      description: "Your emergency contacts have been notified with your location.",
      duration: 5000,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <section className="py-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">You are never alone</h2>
            <p className="text-muted-foreground">Press the button below to send an instant emergency alert</p>
          </div>
          <SOSButton onActivate={handleSOSActivate} isActive={isAlertActive} />
        </section>

        <section className="animate-fade-in-up animation-delay-100"><QuickActions /></section>
        <section className="animate-fade-in-up animation-delay-200"><LocationDisplay /></section>
        <section className="animate-fade-in-up animation-delay-300"><EmergencyContacts /></section>
        <section className="animate-fade-in-up animation-delay-400"><SafetyTips /></section>

        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-soft transition-all duration-300 ${
            isAlertActive ? "bg-sos text-sos-foreground" : "bg-card text-foreground border border-border/50"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isAlertActive ? "bg-white animate-pulse" : "bg-safe"}`} />
            <span className="text-sm font-medium">
              {isAlertActive
                ? isTracking ? "Tracking Live Location..." : "Alert Active"
                : "You are safe"}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
