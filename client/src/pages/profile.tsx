import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Skill, Item } from "@shared/schema";
import { Edit } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["/api/skills", user?.id],
  });
  const { data: items } = useQuery<Item[]>({
    queryKey: ["/api/items", user?.id],
  });

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  async function onSubmit(data: any) {
    try {
      await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profilePicture} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.bio && <p className="mt-2">{user.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>My Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills?.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {skill.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
