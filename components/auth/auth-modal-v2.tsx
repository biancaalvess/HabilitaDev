"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { LoginFormV2 } from "./login-form-v2";
import { RegisterForm } from "./register-form";

interface AuthModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModalV2({ isOpen, onClose }: AuthModalV2Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: { username: string; password: string }) => {
    console.log("Login data:", data);
    setIsLoading(true);

    // Simular login
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      alert("Login realizado com sucesso!");
    }, 2000);
  };

  const handleForgotPassword = () => {
    alert("Funcionalidade de recuperação de senha");
  };

  const handleSignUp = () => {
    setIsLogin(false);
  };

  const handleGoogleLogin = () => {
    alert("Login com Google");
  };

  const handleTwitterLogin = () => {
    alert("Login com Twitter");
  };

  const handleGitHubLogin = () => {
    alert("Login com GitHub");
  };

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-transparent border-none">
        <DialogHeader className="p-6 pb-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-[var(--foreground)] hover:bg-[var(--accent)]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="p-6 pt-0">
          {isLogin ? (
            <LoginFormV2
              onSubmit={handleLogin}
              isLoading={isLoading}
              onForgotPassword={handleForgotPassword}
              onSignUp={handleSignUp}
              onGoogleLogin={handleGoogleLogin}
              onTwitterLogin={handleTwitterLogin}
              onGitHubLogin={handleGitHubLogin}
            />
          ) : (
            <div className="bg-[var(--card)] p-8 rounded-xl text-[var(--foreground)] border border-[var(--border)]">
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={handleSwitchMode}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
