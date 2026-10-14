"use client";

import React, { useState } from "react";
import { RewardDTO } from "@/lib/types";
import {
  Gift,
  Gamepad2,
  UtensilsCrossed,
  Film,
  Banknote,
  Sparkles,
  Check,
  Trophy,
  Music,
  IceCream,
  ShoppingBag,
  Heart,
  Star,
} from "lucide-react";
import confetti from "canvas-confetti";
import { redeemReward } from "@/app/actions";
import { sounds } from "@/lib/sounds";

interface RewardCardProps {
  reward: RewardDTO;
  userBalance: number;
  userId: string;
  onRedeemed?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Gift: <Gift className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  Film: <Film className="w-5 h-5" />,
  Banknote: <Banknote className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  IceCream: <IceCream className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
};

export function RewardCard({
  reward,
  userBalance,
  userId,
  onRedeemed,
}: RewardCardProps) {
  const [loading, setLoading] = useState(false);
  const [justRedeemed, setJustRedeemed] = useState(false);
  const canAfford = userBalance >= reward.costPoints;

  const handleRedeem = async () => {
    sounds.playMechanicalClick();
    if (!canAfford || loading) return;
    setLoading(true);

    try {
      await redeemReward(reward.id, userId);
      setJustRedeemed(true);
      sounds.playFanfare();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f59e0b", "#ec4899", "#3b82f6"],
      });
      onRedeemed?.();
      setTimeout(() => setJustRedeemed(false), 3000);
    } catch (err: any) {
      alert(err.message || "Error al canjear recompensa");
    } finally {
      setLoading(false);
    }
  };

  const iconComponent = iconMap[reward.icon || "Gift"] || <Gift className="w-5 h-5" />;

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm relative overflow-hidden group">
      {/* Glow de fondo si tiene suficientes puntos */}
      {canAfford && (
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {iconComponent}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-black">
            <span>{reward.costPoints}</span>
            <span className="text-[10px] uppercase font-bold">pts</span>
          </div>
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{reward.title}</h4>
        {reward.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{reward.description}</p>
        )}
      </div>

      <div className="pt-2">
        {justRedeemed ? (
          <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>¡Canjeado con éxito!</span>
          </div>
        ) : (
          <button
            onClick={handleRedeem}
            disabled={!canAfford || loading}
            className={`w-full btn-gamified text-xs font-bold py-2.5 px-4 rounded-xl shadow-gamified flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canAfford
                ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 border-b-amber-700 text-amber-950"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-b-slate-300 dark:border-b-slate-900 cursor-not-allowed opacity-60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {loading
                ? "Canjeando..."
                : canAfford
                ? "Canjear recompensa"
                : `Te faltan ${reward.costPoints - userBalance} pts`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
