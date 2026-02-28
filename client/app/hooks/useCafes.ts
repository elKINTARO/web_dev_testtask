"use client";

import { useCallback, useEffect, useState } from "react";
import { getCafes, getCafe } from "@/lib/api";
import {
  apiCafeToRestaurant,
  apiCafeDetailToRestaurant,
  type Restaurant,
} from "@/lib/types";

export function useCafes(category?: string) {
  const [cafes, setCafes] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCafes(category);
        if (!cancelled) {
          setCafes(data.map((c) => apiCafeToRestaurant(c)));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load cafes");
          setCafes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return { cafes, loading, error };
}

export function useCafeDetail(id: number | null) {
  const [cafe, setCafe] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cafeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCafe(cafeId);
      setCafe(apiCafeDetailToRestaurant(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cafe");
      setCafe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id != null) {
      load(id);
    } else {
      setCafe(null);
      setError(null);
    }
  }, [id, load]);

  return { cafe, loading, error, reload: load };
}
