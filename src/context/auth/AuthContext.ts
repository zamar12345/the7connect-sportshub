
import { createContext } from "react";
import { AuthContextType } from "./types";

const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false, // Added this property
  isLoading: true,        // Added this property
  resetPassword: async () => {},
  verifyOtp: async () => {},
  updatePassword: async () => {},
  signOut: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
