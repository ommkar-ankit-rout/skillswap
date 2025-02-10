import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Book, Package, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Notification = {
  id: number;
  userId: number;
  type: "message" | "skill" | "item";
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
  });

  const filteredNotifications = notifications?.filter((notification) =>
    filter === "all" ? true : !notification.read
  );

  async function markAsRead(notificationId: number) {
    try {
      await apiRequest("PATCH", `/api/notifications/${notificationId}`, {
        read: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "skill":
        return <Book className="h-5 w-5" />;
      case "item":
        return <Package className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with exchanges and messages
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {filter === "all" ? "All Notifications" : "Unread Notifications"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Loading notifications...
              </div>
            ) : filteredNotifications?.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                No notifications found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.read ? "bg-background" : "bg-accent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-primary">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {notification.content}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
