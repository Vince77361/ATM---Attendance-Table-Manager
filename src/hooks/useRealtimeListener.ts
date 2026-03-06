import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRealtimeListener = (tableName: string, onRefresh?: () => void) => {
  const router = useRouter();
  useEffect(() => {
    const channel = supabase.channel(`${tableName}-changes`);
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        (payload) => {
          console.log(payload);
          if (onRefresh) {
            onRefresh();
          } else {
            router.refresh();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, tableName, onRefresh]);

  return null;
};
