export interface MilestoneTier {
  id: string;
  name: string;
  badge: string;
  minUsd: number;
  nextUsd: number | null;
  color: string;
  gradient: string;
  description: string;
}

export const RANKING_TIERS: MilestoneTier[] = [
  {
    id: "NOVICE",
    name: "Halcón Iniciado",
    badge: "🦅",
    minUsd: 0,
    nextUsd: 1000,
    color: "#94a3b8",
    gradient: "from-slate-600 to-slate-400",
    description: "Comienza tu trayectoria despegando tus primeras ventas en FALKO.",
  },
  {
    id: "BRONZE",
    name: "Halcón Bronce",
    badge: "🥉",
    minUsd: 1000,
    nextUsd: 10000,
    color: "#cd7f32",
    gradient: "from-amber-700 to-amber-500",
    description: "Superaste $1,000 USD en volumen generado. Vuelo firme y constante.",
  },
  {
    id: "SILVER",
    name: "Halcón Plata",
    badge: "🥈",
    minUsd: 10000,
    nextUsd: 100000,
    color: "#e2e8f0",
    gradient: "from-slate-300 to-cyan-200",
    description: "Más de $10,000 USD generados. Estructura de alto rendimiento.",
  },
  {
    id: "GOLD",
    name: "Halcón Oro",
    badge: "🥇",
    minUsd: 100000,
    nextUsd: 500000,
    color: "#fbbf24",
    gradient: "from-yellow-500 to-amber-300",
    description: "Club de $100,000 USD. Creador y promotor de escala global.",
  },
  {
    id: "DIAMOND",
    name: "Halcón Diamante",
    badge: "💎",
    minUsd: 500000,
    nextUsd: 1000000,
    color: "#00f2fe",
    gradient: "from-cyan-400 to-blue-500",
    description: "Medio millón de USD generado. Autoridad indiscutible en el mercado.",
  },
  {
    id: "APEX",
    name: "Apex Falcon ($1M+)",
    badge: "👑",
    minUsd: 1000000,
    nextUsd: null,
    color: "#a855f7",
    gradient: "from-purple-500 to-cyan-400",
    description: "Nivel legendario. Más de $1,000,000 USD generados en la plataforma.",
  },
];

export function getTierForVolume(volumeUsd: number): MilestoneTier {
  for (let i = RANKING_TIERS.length - 1; i >= 0; i--) {
    if (volumeUsd >= RANKING_TIERS[i].minUsd) {
      return RANKING_TIERS[i];
    }
  }
  return RANKING_TIERS[0];
}

export function calculateTierProgress(volumeUsd: number): {
  currentTier: MilestoneTier;
  nextTier: MilestoneTier | null;
  currentVolume: number;
  nextMilestoneUsd: number | null;
  remainingUsd: number;
  progressPercent: number;
} {
  const currentTier = getTierForVolume(volumeUsd);
  const nextTier = currentTier.nextUsd
    ? RANKING_TIERS.find((t) => t.minUsd === currentTier.nextUsd) || null
    : null;

  if (!nextTier || !currentTier.nextUsd) {
    return {
      currentTier,
      nextTier: null,
      currentVolume: volumeUsd,
      nextMilestoneUsd: null,
      remainingUsd: 0,
      progressPercent: 100,
    };
  }

  const range = currentTier.nextUsd - currentTier.minUsd;
  const progressInsideTier = Math.max(0, volumeUsd - currentTier.minUsd);
  const progressPercent = Math.min(100, Math.max(0, parseFloat(((progressInsideTier / range) * 100).toFixed(1))));
  const remainingUsd = parseFloat((currentTier.nextUsd - volumeUsd).toFixed(2));

  return {
    currentTier,
    nextTier,
    currentVolume: volumeUsd,
    nextMilestoneUsd: currentTier.nextUsd,
    remainingUsd: Math.max(0, remainingUsd),
    progressPercent,
  };
}
