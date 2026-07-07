"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { useGeoapifyAutocomplete, GeoapifyLocation } from "../../hooks/useGeoapifyAutocomplete";

interface LocationSearchProps {
  onSelect: (location: {
    formatted_address: string;
    country: string;
    state?: string;
    district?: string;
    region?: string;
    city: string;
    latitude: number;
    longitude: number;
  } | null) => void;
  selectedLocation: {
    formatted_address: string;
    latitude: number;
    longitude: number;
  } | null;
}

export default function LocationSearch({ onSelect, selectedLocation }: LocationSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, loading, error, triggerSearch } = useGeoapifyAutocomplete();

  // Reset highlighted suggestion index when suggestions list updates
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Sync local input text when external selectedLocation updates
  useEffect(() => {
    if (selectedLocation) {
      setInputValue(selectedLocation.formatted_address);
    } else {
      setInputValue("");
    }
  }, [selectedLocation]);

  // Close suggestions list on click outside of component boundaries
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    triggerSearch(val);

    if (!val.trim()) {
      onSelect(null);
    }
  };

  const handleSelectSuggestion = (item: GeoapifyLocation) => {
    // Apply geocoding fallbacks requested: city -> town -> village -> suburb -> county
    const commaIdx = item.formatted.indexOf(",");
    const primary = commaIdx !== -1 ? item.formatted.substring(0, commaIdx) : item.formatted;
    const secondary = commaIdx !== -1 ? item.formatted.substring(commaIdx + 1).trim() : "";
    const city = item.city ?? item.town ?? item.village ?? item.suburb ?? item.county ?? primary;
    const district = item.county ?? "";

    const mappedLocation = {
      formatted_address: item.formatted,
      country: item.country ?? "",
      state: item.state ?? "",
      district: district,
      region: secondary || item.country || "",
      city: city || primary,
      latitude: item.lat,
      longitude: item.lon
    };

    onSelect(mappedLocation);
    setInputValue(item.formatted);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectSuggestion(suggestions[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSelect(null);
    setIsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {!selectedLocation ? (
        // Input Search Box Mode
        <div className="w-full relative">
          <div className="w-full flex items-center h-12 px-4 rounded-2xl bg-zinc-950/40 border border-white/10 focus-within:border-brand-purple focus-within:ring-1 focus-within:ring-brand-purple/50 focus-within:shadow-[0_0_12px_rgba(139,92,246,0.15)] transition-all gap-3">
            <Search className="h-5 w-5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder="Search city, district, state or country..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full font-semibold"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-all shrink-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Box */}
          {isOpen && inputValue.trim() !== "" && (
            <div 
              data-lenis-prevent
              className="absolute left-0 right-0 top-13 z-50 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-0.5 max-h-[260px] overflow-y-auto no-scrollbar backdrop-blur-xl"
            >
              {loading && (
                <div className="flex items-center gap-2 px-3 py-3 text-zinc-500 text-xs font-semibold font-sans">
                  <Loader2 className="h-4 w-4 text-brand-purple animate-spin" />
                  <span>Searching...</span>
                </div>
              )}

              {error && !loading && (
                <div className="px-3 py-3 text-rose-500 text-xs font-semibold font-sans">
                  ⚠️ {error}
                </div>
              )}

              {!loading && !error && suggestions.length === 0 && (
                <div className="px-3 py-3 text-zinc-500 text-xs font-semibold font-sans">
                  No matching locations found.
                </div>
              )}

              {!loading && !error && suggestions.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;
                
                // Separate primary address line from secondary address lines
                const commaIdx = item.formatted.indexOf(",");
                const primary = commaIdx !== -1 ? item.formatted.substring(0, commaIdx) : item.formatted;
                const secondary = commaIdx !== -1 ? item.formatted.substring(commaIdx + 1).trim() : "";

                return (
                  <button
                    key={`suggestion-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer text-left w-full transition-all duration-150 select-none ${
                      isHighlighted 
                        ? "bg-brand-purple/10 text-white font-bold" 
                        : "hover:bg-white/5 text-zinc-300"
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-brand-purple shrink-0 mt-0.5" />
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-xs font-bold text-white truncate">{primary}</span>
                      {secondary && <span className="text-[10px] text-zinc-500 truncate mt-0.5">{secondary}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Locked Location Info Card Mode
        <div className="w-full h-12 bg-zinc-950/60 border border-brand-purple/20 px-3.5 rounded-2xl flex items-center justify-between gap-3 text-left shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <MapPin className="h-4.5 w-4.5 text-brand-purple shrink-0 animate-pulse" />
            <span className="text-xs font-black text-white truncate flex-1 leading-none">
              {selectedLocation.formatted_address}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="h-7 w-7 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer flex items-center justify-center"
            title="Clear Location"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
