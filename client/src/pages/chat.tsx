import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import type { Chat, Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Chat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: chats } = useQuery<Chat[]>({
    queryKey: ["/api/chats", user?.id],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedChat?.id],
    enabled: !!selectedChat,
  });

  const { data: chatUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await apiRequest("POST", "/api/messages", {
        chatId: selectedChat.id,
        senderId: user?.id,
        content: newMessage,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedChat.id] });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  const getChatUser = (chat: Chat) => {
    const otherId = chat.userOneId === user?.id ? chat.userTwoId : chat.userOneId;
    return chatUsers?.find((u) => u.id === otherId);
  };

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {chats?.map((chat) => {
              const otherUser = getChatUser(chat);
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    selectedChat?.id === chat.id ? "bg-accent" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={otherUser?.profilePicture || undefined} />
                    <AvatarFallback>{otherUser?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{otherUser?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {chat.lastMessage}
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        {selectedChat ? (
          <>
            <CardHeader>
              <CardTitle>
                {getChatUser(selectedChat)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <form
                onSubmit={sendMessage}
                className="mt-4 flex items-center gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="h-full flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </CardContent>
        )}
      </Card>
    </div>
  );
}