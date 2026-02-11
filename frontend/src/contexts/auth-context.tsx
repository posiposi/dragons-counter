import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type User, type AuthRequest } from "@/types/user";
import {
  signup as apiSignup,
  signin as apiSignin,
  signout as apiSignout,
  fetchCurrentUser,
} from "@/lib/api/auth";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (request: AuthRequest) => Promise<void>;
  signin: (request: AuthRequest) => Promise<void>;
  signout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const currentUser = await fetchCurrentUser(accessToken);
          setUser(currentUser);
        } catch {
          localStorage.removeItem("accessToken");
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const signup = useCallback(async (request: AuthRequest) => {
    await apiSignup(request);
  }, []);

  const signin = useCallback(async (request: AuthRequest) => {
    const response = await apiSignin(request);
    localStorage.setItem("accessToken", response.accessToken);
    try {
      const currentUser = await fetchCurrentUser(response.accessToken);
      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem("accessToken");
      throw error;
    }
  }, []);

  const signout = useCallback(() => {
    apiSignout();
    setUser(null);
  }, []);

  return (
    <AuthContext value={{ user, isAuthenticated: user !== null, isLoading, signup, signin, signout }}>
      {children}
    </AuthContext>
  );
}
