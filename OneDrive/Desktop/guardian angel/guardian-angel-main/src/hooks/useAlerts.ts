import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Alert {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  location_text: string;
  status: "active" | "resolved" | "cancelled";
  contacts_notified: number;
  response_time_min: number | null;
  created_at: string;
  resolved_at: string | null;
}

export const useAlerts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Alert[];
    },
    enabled: !!user,
  });

  const createAlert = useMutation({
    mutationFn: async (alert: { latitude?: number; longitude?: number; location_text?: string; contacts_notified?: number }) => {
      const { data, error } = await supabase.from("alerts").insert({
        ...alert,
        user_id: user!.id,
        status: "active",
      }).select().single();
      if (error) throw error;
      console.log("Created alert ID:", data?.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateAlert = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "resolved") updates.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("alerts").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { alerts: query.data ?? [], isLoading: query.isLoading, createAlert, updateAlert };
};
