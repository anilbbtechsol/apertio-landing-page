"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const partners = [
  {
    name: "Honeywell",
    src: "/partners/honeywell.png",
    width: 160,
    height: 36,
  },
  {
    name: "Suprema",
    src: "/partners/suprema.webp",
    width: 150,
    height: 46,
  },
  {
    name: "Spectra",
    src: "/partners/spectra.webp",
    width: 148,
    height: 49,
  },
  {
    name: "Spintly",
    src: "/partners/spintly.png",
    width: 160,
    height: 76,
  },
] as const;

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function PartnerMark({
  partner,
}: {
  partner: (typeof partners)[number];
}) {
  return (
    <div className="flex h-16 w-48 shrink-0 items-center justify-center px-6">
      <Image
        src={partner.src}
        alt={partner.name}
        width={partner.width}
        height={partner.height}
        className="h-auto max-h-10 w-auto max-w-[9rem] object-contain"
      />
    </div>
  );
}

export function PartnersMarquee() {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const row = [...partners, ...partners, ...partners, ...partners];

  return (
    <section id="partners" className="relative overflow-hidden py-16">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-cobalt uppercase">
          Strategic integrations
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Built with access-management collaborators
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Apertio works alongside leading access-control partners so temporary
          credentials and attendance punches land on the hardware you already
          trust — without a rip-and-replace.
        </p>
      </div>

      <div className="relative mt-12 w-full overflow-hidden border-y border-slate-200/60 bg-white">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />

        {reduceMotion ? (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 py-6">
            {partners.map((partner) => (
              <PartnerMark key={partner.name} partner={partner} />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex w-max py-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 24, ease: "linear", repeat: Infinity }}
          >
            {row.map((partner, i) => (
              <PartnerMark key={`${partner.name}-${i}`} partner={partner} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
