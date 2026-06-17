"use client";

import { useEffect } from "react";
import { useConfig } from "./config-store";
import type { ProductKey } from "@/lib/site";

/* Synchronise le produit actif du configurateur depuis ?produit=one|max.
   Lecture côté client (window.location) pour éviter la contrainte Suspense
   de useSearchParams. */
export function ProductSync() {
  const { setProduct } = useConfig();
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("produit");
    if (q === "one" || q === "max") setProduct(q as ProductKey);
  }, [setProduct]);
  return null;
}
