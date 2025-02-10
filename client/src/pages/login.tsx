import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to UniExchange</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={login} 
            className="w-full"
            size="lg"
          >
            <SiGoogle className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
