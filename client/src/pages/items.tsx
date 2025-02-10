import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema } from "@shared/schema";
import type { Item } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus } from "lucide-react";

export default function Items() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const { data: items, isLoading } = useQuery<Item[]>({ queryKey: ["/api/items"] });

  const form = useForm({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      status: "available",
      userId: user?.id,
    },
  });

  const filteredItems = items?.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/items", data);
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Items Exchange</h1>
          <p className="text-muted-foreground">
            Browse and share items with other students
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Add Item
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems?.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-lg border hover:bg-accent transition-colors"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <div className="font-medium text-lg">{item.name}</div>
            <div className="text-muted-foreground mt-2">
              {item.description}
            </div>
            <div className="mt-4">
              <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
