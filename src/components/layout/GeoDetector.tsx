"use client";

import { useEffect } from "react";
import { autoDetectAndApplyGeo } from "@/lib/geo";

export function GeoDetector() {
  useEffect(() => {
    // Detect and apply regional currency & country if not already chosen
    autoDetectAndApplyGeo().catch((err) => {
      console.warn("GeoDetector background error:", err);
    });
  }, []);

  return null;
}
