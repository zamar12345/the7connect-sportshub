
import { ReactNode } from "react";
import Logo from "@/components/Logo";

interface AuthContainerProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthContainer = ({ children, title, subtitle }: AuthContainerProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-4" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};
