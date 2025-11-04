"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { AuthModalV2 } from "@/components/auth/auth-modal-v2";

export function QuestoesHeader() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="HabilitaDev"
              width={28}
              height={28}
              className="rounded sm:w-8 sm:h-8"
            />
            <span className="text-lg sm:text-xl font-bold text-white">HabilitaDev</span>
          </div>

          {/* Login Button - Canto direito */}
          <div className="flex items-center">
            {user ? (
              <UserMenu />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="text-white/80 hover:text-white hover:bg-blue-500/20 transition-colors flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModalV2
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
