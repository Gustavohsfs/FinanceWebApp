"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const PATH =
  "M0,180 C60,140 90,200 150,150 C210,100 240,190 300,140 C360,90 390,170 450,130 C510,90 540,150 600,110 L600,300 L0,300 Z";

/** Painel decorativo do split screen de auth — gráfico de saldo em loop suave e translúcido. */
export function AuthVisualPanel() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 600 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="auth-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={PATH}
          fill="url(#auth-gradient)"
          stroke="#FF8A2B"
          strokeOpacity={0.4}
          strokeWidth={1.5}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-16 text-center">
        <p className="font-display text-display font-semibold text-bone">Entenda e planeje.</p>
        <p className="max-w-sm text-body text-bone-600">
          O mobile registra em 5 segundos. O web mostra o que esses segundos constroem.
        </p>
        <Link
          href="/baixar"
          className="mt-2 inline-flex items-center gap-1.5 text-small font-medium text-flame-400 transition-colors hover:text-flame-500"
        >
          Baixe o app Android
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
