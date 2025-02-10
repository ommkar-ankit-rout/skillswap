import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Exchange Skills & Items with Fellow Students
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with students at your university to share knowledge and resources.
          Learn new skills and find the items you need.
        </p>
        <Link href="/login">
          <Button size="lg" className="mt-4">Join Now</Button>
        </Link>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Exchange Skills</h2>
          <p className="text-muted-foreground">
            Whether you're looking to learn a new language, master a musical instrument,
            or get help with coding, find students who can help you grow.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Exchange Items</h2>
          <p className="text-muted-foreground">
            From textbooks to dorm essentials, find and share resources with your
            fellow students in a sustainable way.
          </p>
        </section>
      </div>
    </div>
  );
}
