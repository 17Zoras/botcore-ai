import { Clock, MapPin, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import { useAlerts, Alert } from "@/hooks/useAlerts";
import { formatDistanceToNow } from "date-fns";

const getStatusBadge = (status: Alert["status"]) => {
  switch (status) {
    case "resolved":
      return <Badge className="bg-safe/10 text-safe border-safe/20"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>;
    case "cancelled":
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
    case "active":
      return <Badge className="bg-sos/10 text-sos border-sos/20"><AlertTriangle className="w-3 h-3 mr-1" />Active</Badge>;
  }
};

const AlertCard = ({ alert, onResolve, onCancel }: { alert: Alert; onResolve: () => void; onCancel: () => void }) => (
  <Card className="gradient-card shadow-card border-0">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
        </div>
        {getStatusBadge(alert.status)}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-foreground">{alert.location_text || "Location captured"}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {alert.contacts_notified} contacts notified
          {alert.response_time_min && ` • ${alert.response_time_min} min response`}
        </p>
        {alert.status === "active" && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button size="sm" onClick={onResolve}>Resolve</Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const History = () => {
  const { alerts, isLoading, updateAlert } = useAlerts();

  const resolved = alerts.filter(a => a.status === "resolved");
  const cancelled = alerts.filter(a => a.status === "cancelled");
  const avgResponse = resolved.filter(a => a.response_time_min).reduce((sum, a) => sum + (a.response_time_min ?? 0), 0) / (resolved.filter(a => a.response_time_min).length || 1);

  if (isLoading) {
    return <Layout><div className="space-y-4 p-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div></Layout>;
  }

  const renderAlerts = (list: Alert[]) =>
    list.length === 0 ? (
      <Card className="gradient-card shadow-card border-0">
        <CardContent className="py-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No alerts yet</p>
        </CardContent>
      </Card>
    ) : (
      list.map(alert => (
        <AlertCard key={alert.id} alert={alert}
          onResolve={() => updateAlert.mutate({ id: alert.id, status: "resolved" })}
          onCancel={() => updateAlert.mutate({ id: alert.id, status: "cancelled" })} />
      ))
    );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert History</h1>
          <p className="text-muted-foreground">View your past emergency alerts</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="gradient-card shadow-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </CardContent>
          </Card>
          <Card className="gradient-card shadow-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-safe">{resolved.length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card className="gradient-card shadow-card border-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{avgResponse > 0 ? `~${Math.round(avgResponse)}m` : "—"}</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1">Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-3">{renderAlerts(alerts)}</TabsContent>
          <TabsContent value="resolved" className="mt-4 space-y-3">{renderAlerts(resolved)}</TabsContent>
          <TabsContent value="cancelled" className="mt-4 space-y-3">{renderAlerts(cancelled)}</TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default History;
