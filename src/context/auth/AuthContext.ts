
import { createContext } from "react";
import { AuthContextType } from "./types";

const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  resetPassword: async () => {},
  verifyOtp: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
