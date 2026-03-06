import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRealtimeListener = (tableName: string) => {
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
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, tableName]);

  return null;
};
