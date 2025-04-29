
import { useState } from "react";
import { User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UsernameLoginFormProps {
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

export const UsernameLoginForm = ({ username, setUsername, password, setPassword }: UsernameLoginFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <User className="text-muted-foreground w-5 h-5" />
        <Input
          id="signin-username"
          name="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Lock className="text-muted-foreground w-5 h-5" />
        <Input
          id="signin-password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
    </div>
  );
};
