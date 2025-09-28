"use client";

import React, { forwardRef } from "react";
import { Search, Filter } from "lucide-react";

interface FuturisticInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showSearchIcon?: boolean;
  showFilterIcon?: boolean;
  onFilterClick?: () => void;
}

export const FuturisticInput = forwardRef<
  HTMLInputElement,
  FuturisticInputProps
>(
  (
    {
      showSearchIcon = true,
      showFilterIcon = false,
      onFilterClick,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="futuristic-input-wrapper">
        <div className="grid" />
        <div id="poda">
          <div className="glow" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="white" />
          <div className="border" />
          <div id="main">
            <input
              ref={ref}
              placeholder={props.placeholder || "Search..."}
              type={props.type || "text"}
              name={props.name || "text"}
              className={`input ${className}`}
              {...props}
            />
            <div id="input-mask" />
            <div id="pink-mask" />
            <div className="filterBorder" />

            {showFilterIcon && (
              <div id="filter-icon" onClick={onFilterClick}>
                <Filter className="w-4 h-4 text-[#d6d6e6]" />
              </div>
            )}

            {showSearchIcon && (
              <div id="search-icon">
                <Search className="w-5 h-5 text-[#d6d6e6]" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FuturisticInput.displayName = "FuturisticInput";
