import { AlertTriangle, CheckCircle2, Info, Clock, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "alert": return <AlertTriangle className="w-5 h-5 text-sos" />;
    case "success": return <CheckCircle2 className="w-5 h-5 text-safe" />;
    case "info": return <Info className="w-5 h-5 text-primary" />;
  }
};

const getIconBg = (type: Notification["type"]) => {
  switch (type) {
    case "alert": return "bg-sos/10";
    case "success": return "bg-safe/10";
    case "info": return "bg-primary/10";
  }
};

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationsPanel = ({ onClose }: NotificationsPanelProps) => {
  const { notifications, unreadCount, markAllRead, deleteNotification, clearAll } = useNotifications();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()} disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4 mr-1" />Mark all read
          </Button>
          <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()} disabled={notifications.length === 0}>
            <Trash2 className="w-4 h-4 mr-1" />Clear
          </Button>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 -mx-6 px-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`group relative p-4 rounded-xl transition-colors ${notification.read ? "bg-muted/30" : "bg-accent/50"}`}>
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full ${getIconBg(notification.type)} flex items-center justify-center flex-shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-foreground ${!notification.read ? "font-semibold" : ""}`}>{notification.title}</p>
                      {!notification.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => deleteNotification.mutate(notification.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationsPanel;
