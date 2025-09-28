"use client";

import { useState } from "react";
import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { AuthModalV2 } from "./auth/auth-modal-v2";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  TI
                </span>
              </div>
              <h1 className="text-xl font-semibold">TechInterview</h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <FuturisticInput
              placeholder="Buscar questões..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              showSearchIcon={true}
              showFilterIcon={false}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Contribuir
            </Button>

            {user ? (
              <UserMenu />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAuthModal(true)}
              >
                <User className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <AuthModalV2
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
