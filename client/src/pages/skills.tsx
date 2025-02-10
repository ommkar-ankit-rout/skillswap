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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSkillSchema } from "@shared/schema";
import type { Skill } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus } from "lucide-react";

export default function Skills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const { data: skills, isLoading } = useQuery<Skill[]>({ queryKey: ["/api/skills"] });

  const form = useForm({
    resolver: zodResolver(insertSkillSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "offering",
      userId: user?.id,
    },
  });

  const filteredSkills = skills?.filter(
    (skill) =>
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      skill.description.toLowerCase().includes(search.toLowerCase())
  );

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/skills", data);
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skills Exchange</h1>
          <p className="text-muted-foreground">
            Share your expertise and learn from others
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Skill</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="offering">Offering</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Add Skill
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills?.map((skill) => (
          <div
            key={skill.id}
            className="p-6 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="font-medium text-lg">{skill.name}</div>
            <div className="text-muted-foreground mt-2">
              {skill.description}
            </div>
            <div className="mt-4">
              <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">
                {skill.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
