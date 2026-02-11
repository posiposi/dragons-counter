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
  signout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        // Cookie無効 or 未認証: ユーザーはnullのまま
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const signup = useCallback(async (request: AuthRequest) => {
    await apiSignup(request);
  }, []);

  const signin = useCallback(async (request: AuthRequest) => {
    await apiSignin(request);
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const signout = useCallback(async () => {
    await apiSignout();
    setUser(null);
  }, []);

  return (
    <AuthContext
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signup,
        signin,
        signout,
      }}
    >
      {children}
    </AuthContext>
  );
}
