import { useState, useEffect } from "react";
import axios from "axios";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name: string;
}

export function useNominatim(query: string) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: `${query} Istanbul`,
              format: "json",
              limit: 5,
              addressdetails: 1,
            },
            headers: { "Accept-Language": "en" },
          }
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return { results, isLoading };
}
