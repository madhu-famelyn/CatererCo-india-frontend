import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { notifications as mockNotifications } from "@/data/mock";
import { notificationService } from "@/services/notificationService";
import { formatTimeAgo } from "@/lib/format";

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: apiNotifications = [], isLoading } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: () => notificationService.getNotifications().catch(() => []),
  });

  const list = apiNotifications.length > 0 ? apiNotifications : mockNotifications;

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    } catch (e) {
      // Mock item fallback
    }
  };

  return (
    <>
      <PageHeader title="Notifications" description="Real-time updates regarding your quotes, bookings, and messages." />
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-4">Loading notifications…</div>
      ) : (
        <Card className="divide-y divide-border">
          {list.map((n, i) => (
            <div
              key={n.id || i}
              onClick={() => handleMarkRead(n.id)}
              className={`flex gap-4 p-5 cursor-pointer hover:bg-muted/50 transition ${n.unread ? "bg-[var(--primary)]/5 font-medium" : ""}`}
            >
              {n.unread ? (
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)] animate-pulse" />
              ) : (
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-border" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.created_at ? formatTimeAgo(n.created_at) : (n.time || "Just now")}</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{n.body}</div>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
        </Card>
      )}
    </>
  );
}

