"use client";

import { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FuturisticInput } from "@/components/ui/futuristic-input";
import { useDebounce } from "@/hooks/use-debounce";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  // Debounce do valor de busca (500ms de delay)
  const debouncedSearch = useDebounce(searchInput, 500);

  // Atualizar busca quando o valor debounced mudar
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  // Sincronizar searchInput quando searchQuery mudar externamente
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">
                  TI
                </span>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold hidden xs:block">TechInterview</h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-2 sm:mx-4 md:mx-8 hidden sm:block">
            <FuturisticInput
              placeholder="Buscar questões..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              showSearchIcon={true}
              showFilterIcon={false}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm">
              Contribuir
            </Button>

            <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="sm:hidden px-3 pb-3">
          <FuturisticInput
            placeholder="Buscar questões..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            showSearchIcon={true}
            showFilterIcon={false}
          />
        </div>
      </header>
    </>
  );
}
