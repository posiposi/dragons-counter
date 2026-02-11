import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <SignupForm />;
}
