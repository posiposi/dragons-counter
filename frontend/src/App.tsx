import { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { useAuth } from "@/hooks/use-auth";
import GameList from "@/components/GameList";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import styles from "./App.module.css";

function AppContent() {
  const { isAuthenticated, isLoading, signout } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  if (isLoading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return authMode === "login" ? (
      <LoginForm onSwitchToSignup={() => setAuthMode("signup")} />
    ) : (
      <SignupForm onSwitchToLogin={() => setAuthMode("login")} />
    );
  }

  return <GameList onSignout={signout} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
