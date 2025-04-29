
import { SignupFormContent } from "./SignupFormContent";
import { SocialLoginButtons } from "./SocialLoginButtons";

export const SignUpForm = () => {
  return (
    <>
      <SignupFormContent />
      
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <SocialLoginButtons />
      </div>
    </>
  );
};
