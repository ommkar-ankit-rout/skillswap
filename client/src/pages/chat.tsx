import { useEffect, useState, useRef } from "react";
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
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { isConnected, sendMessage, socket } = useWebSocket();

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

  useEffect(() => {
    if (messages) {
      setLocalMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          setLocalMessages(prev => [...prev, {
            id: Date.now(), // Temporary ID for local message
            chatId: selectedChat?.id || 0,
            senderId: data.senderId,
            content: data.message,
            createdAt: data.timestamp,
          }]);
        }
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      // Send message through WebSocket
      const otherUserId = selectedChat.userOneId === user.id 
        ? selectedChat.userTwoId 
        : selectedChat.userOneId;

      const sent = sendMessage(otherUserId, newMessage);

      if (sent) {
        // Add message to local state immediately
        setLocalMessages(prev => [...prev, {
          id: Date.now(), // Temporary ID for local message
          chatId: selectedChat.id,
          senderId: user.id,
          content: newMessage,
          createdAt: new Date().toISOString(),
        }]);

        // Also save to backend
        await apiRequest("POST", "/api/messages", {
          chatId: selectedChat.id,
          senderId: user.id,
          content: newMessage,
        });

        setNewMessage("");
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please check your connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
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
          <CardTitle className="flex items-center justify-between">
            Conversations
            {isConnected && (
              <span className="text-xs text-green-500">●&nbsp;Connected</span>
            )}
          </CardTitle>
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
                  {localMessages.map((message) => (
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
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
              <form
                onSubmit={handleSendMessage}
                className="mt-4 flex items-center gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                />
                <Button type="submit" size="icon" disabled={!isConnected}>
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