import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Package, Search } from "lucide-react";
import type { Skill, Item } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: skills } = useQuery<Skill[]>({ queryKey: ["/api/skills"] });
  const { data: items } = useQuery<Item[]>({ queryKey: ["/api/items"] });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Browse skills and items available for exchange
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills and items..."
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Latest Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {skills?.map((skill) => (
                <div
                  key={skill.id}
                  className="mb-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {skill.description}
                  </div>
                  <div className="text-sm mt-2">
                    <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {skill.type}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Latest Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {items?.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                  <div className="text-sm mt-2">
                    <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
