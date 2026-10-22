"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Crosshair,
  MapPinned,
  QrCode,
  Route,
  Sparkles,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  {
    icon: QrCode,
    title: "Digital Pass",
    text: "Visitor receives a digital pass with waypoint instructions built in.",
  },
  {
    icon: Route,
    title: "Optimal Routing",
    text: "System maps the best path from the office entrance to the meeting room.",
  },
  {
    icon: Crosshair,
    title: "Mobile Overlay",
    text: "Navigation overlay on the visitor’s own phone or tablet — no special hardware.",
  },
  {
    icon: MapPinned,
    title: "Real-time Guidance",
    text: "Live steps with floor and building context so guests stay on track.",
  },
] as const;

function FloorPlanMock() {
  return (
    <div className="wp-mock relative mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border border-slate-200/90 bg-slate-900 p-2.5 shadow-[0_28px_60px_rgb(15_23_42_/0.22)]">
        <div className="overflow-hidden rounded-[1.55rem] bg-[#f4f1e8]">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Step 1/3
            </span>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              Pinch to Zoom
            </span>
          </div>

          <div className="relative mx-3 mb-3 aspect-[4/5] overflow-hidden rounded-2xl border border-slate-300/60 bg-[#ebe6d8]">
            {/* Simplified floor plan */}
            <div className="absolute inset-3 grid grid-cols-3 gap-1.5 opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm border border-slate-400/50 bg-white/30"
                />
              ))}
            </div>

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 200 250"
              fill="none"
              aria-hidden
            >
              <path
                d="M40 210 C55 170, 70 140, 95 110 S140 55, 155 40"
                stroke="#2563eb"
                strokeWidth="3"
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
              <circle cx="40" cy="210" r="8" fill="#22c55e" />
              <circle cx="40" cy="210" r="14" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.45" />
              <path
                d="M155 28 L162 48 L155 42 L148 48 Z"
                fill="#ef4444"
              />
            </svg>

            <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold text-ink">enter lift</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Follow the path to Building A · Floor 2
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              type="button"
              tabIndex={-1}
              className="w-full rounded-xl bg-cobalt py-2.5 text-xs font-semibold text-white"
            >
              Next Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WaypointSystem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".wp-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });

      gsap.from(".wp-step", {
        opacity: 0,
        x: 24,
        stagger: 0.1,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".wp-steps",
          start: "top 80%",
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="waypoint"
      ref={root}
      aria-labelledby="wp-title"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="wp-reveal max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-cobalt uppercase">
            The Waypoint System
          </p>
          <h2
            id="wp-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Smart navigation: from entrance to meeting room
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            After check-in, guests follow a live indoor path on their phone —
            fewer lost visitors, less reception load, tighter security.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="wp-reveal">
            <FloorPlanMock />
          </div>

          <div className="wp-steps space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="wp-step glass group flex gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cobalt text-white shadow-[0_8px_24px_rgb(37_99_235_/0.3)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[11px] font-bold tracking-wider text-cobalt">
                        0{i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-strong flex gap-3 rounded-2xl p-5"
            >
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm leading-relaxed text-slate-700">
                Reduces confusion, improves the arrival experience, and keeps
                guests on authorized routes.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
