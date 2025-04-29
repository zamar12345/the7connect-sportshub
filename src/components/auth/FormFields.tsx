
import { User, Mail, Lock } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { SignupFormValues } from "./schemas/signupSchema";

interface NameFieldsProps {
  control: Control<SignupFormValues>;
}

export const NameFields = ({ control }: NameFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2">
              <User className="text-muted-foreground w-5 h-5" />
              <FormControl>
                <Input placeholder="First Name" id="signup-firstName" name="firstName" {...field} />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="Last Name" id="signup-lastName" name="lastName" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const UsernameField = ({ control }: { control: Control<SignupFormValues> }) => {
  return (
    <FormField
      control={control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center space-x-2">
            <User className="text-muted-foreground w-5 h-5" />
            <FormControl>
              <Input placeholder="Username" id="signup-username" name="username" {...field} />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const EmailField = ({ control }: { control: Control<SignupFormValues> }) => {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center space-x-2">
            <Mail className="text-muted-foreground w-5 h-5" />
            <FormControl>
              <Input type="email" placeholder="Email" id="signup-email" name="email" {...field} />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PasswordFields = ({ control }: { control: Control<SignupFormValues> }) => {
  return (
    <>
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2">
              <Lock className="text-muted-foreground w-5 h-5" />
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)" 
                  id="signup-password"
                  name="password"
                  {...field} 
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2">
              <Lock className="text-muted-foreground w-5 h-5" />
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Confirm Password" 
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  {...field} 
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
