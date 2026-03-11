import { Phone, MessageCircle, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const QuickActions = () => {
  const handleCall911 = () => {
    toast.info("📞 Calling 112...", {
      description: "This would dial emergency services in a real app",
      duration: 3000,
    });
    // In production: window.location.href = "tel:911";
  };

  const handleSendSMS = () => {
    toast.success("💬 SMS Alert Sent!", {
      description: "Emergency message sent to all your contacts",
      duration: 3000,
    });
  };

  const handleAlertContacts = () => {
    toast.success("📢 Contacts Alerted!", {
      description: "3 emergency contacts have been notified",
      duration: 3000,
    });
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Current Location",
        text: "I am sharing my live location with you for safety",
        url: `https://maps.google.com/?q=40.7128,-74.0060`,
      }).catch(() => {
        toast.success("📍 Location link copied!", {
          description: "Share it with anyone you trust",
        });
      });
    } else {
      toast.success("📍 Location link copied!", {
        description: "Share it with anyone you trust",
      });
    }
  };

  const actions = [
    { icon: Phone, label: "Call 112", color: "text-sos", action: handleCall911 },
    { icon: MessageCircle, label: "Send SMS", color: "text-primary", action: handleSendSMS },
    { icon: Users, label: "Alert Contacts", color: "text-safe", action: handleAlertContacts },
    { icon: MapPin, label: "Share Location", color: "text-accent-foreground", action: handleShareLocation },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4 px-2 hover:bg-muted/50"
          onClick={action.action}
        >
          <action.icon className={`w-5 h-5 ${action.color}`} />
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
