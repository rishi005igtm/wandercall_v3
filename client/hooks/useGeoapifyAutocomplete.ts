import { useState, useEffect, useRef, useCallback } from "react";

export interface GeoapifyLocation {
  formatted: string;
  country?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  lat: number;
  lon: number;
}

// In-memory cache to store query results and avoid duplicate network calls
const searchCache: Record<string, GeoapifyLocation[]> = {};

export function useGeoapifyAutocomplete() {
  const [suggestions, setSuggestions] = useState<GeoapifyLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const triggerSearch = useCallback((text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Return cached results if available
    if (searchCache[trimmedText]) {
      setSuggestions(searchCache[trimmedText]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimeoutRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
        const baseUrl = process.env.NEXT_PUBLIC_GEOAPIFY_AUTOCOMPLETE_URL;

        if (!apiKey || !baseUrl) {
          throw new Error("Geoapify environment variables are missing.");
        }

        const url = `${baseUrl}?text=${encodeURIComponent(trimmedText)}&limit=5&format=json&apiKey=${apiKey}`;

        const response = await fetch(url, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error(`Geoapify API failed with status ${response.status}`);
        }

        const data = await response.json();
        const results: GeoapifyLocation[] = (data.results || []).map((item: any) => ({
          formatted: item.formatted,
          country: item.country,
          state: item.state,
          county: item.county,
          city: item.city,
          town: item.town,
          village: item.village,
          suburb: item.suburb,
          lat: Number(item.lat),
          lon: Number(item.lon)
        }));

        // Cache the parsed results
        searchCache[trimmedText] = results;

        setSuggestions(results);
        setLoading(false);
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("Geoapify Autocomplete error:", err);
        setError("Unable to fetch locations. Please try again.");
        setSuggestions([]);
        setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    triggerSearch
  };
}
