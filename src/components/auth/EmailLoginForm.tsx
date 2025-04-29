
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

export const EmailLoginForm = ({ email, setEmail, password, setPassword }: EmailLoginFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Mail className="text-muted-foreground w-5 h-5" />
        <Input
          id="signin-email"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
