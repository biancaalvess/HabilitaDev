"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginModalPT } from "./login-modal-pt";
import { RegisterForm } from "./register-form";

interface AuthModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModalV2({ isOpen, onClose }: AuthModalV2Props) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleSuccess = () => {
    onClose();
    // Recarregar página para atualizar estado do usuário
    window.location.reload();
  };

  return (
    <>
      {isLogin ? (
        <LoginModalPT
          isOpen={isOpen}
          onClose={onClose}
          onSwitchToRegister={handleSwitchToRegister}
        />
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-slate-800/95 backdrop-blur-sm border border-blue-400/20 p-0 gap-0">
            <DialogTitle className="sr-only">Criar Conta</DialogTitle>
            <div className="p-6 sm:p-8">
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={handleSwitchToLogin}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
