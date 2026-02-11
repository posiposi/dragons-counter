import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}
