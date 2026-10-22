"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  BellRing,
  CalendarCheck2,
  Clock3,
  Gauge,
  Hand,
  ShieldCheck,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const features = [
  {
    icon: CalendarCheck2,
    title: "Real-Time Availability",
    text: "See which rooms are free, when, and for how long. Double-bookings are blocked at the database level.",
  },
  {
    icon: Gauge,
    title: "Daily Meeting Limits",
    text: "Set a max meetings-per-room-per-day (e.g. 8 in a conference room). Over the limit? Hosts request admin approval with a reason.",
  },
  {
    icon: Clock3,
    title: "Long-Duration Approvals",
    text: "Configure a max meeting duration (e.g. 2 hours). Longer bookings automatically trigger an approval request.",
  },
  {
    icon: Hand,
    title: "One-Tap Approvals",
    text: "Hosts submit context; admins approve or reject in seconds. Control stays centralized while teams stay empowered.",
  },
  {
    icon: BellRing,
    title: "Approval Notifications",
    text: "Hosts get instant feedback. Approved = booking confirmed. Rejected = a reason and a path to rebook.",
  },
] as const;

const whyItMatters = [
  {
    title: "Prevent meeting bloat",
    text: "Stop high-value spaces from being monopolized — like one person holding a large room for hours of back-to-back calls.",
  },
  {
    title: "Chaos prevention",
    text: "Configurable limits and approval workflows keep scheduling under control while leaving room for legitimate exceptions.",
  },
] as const;

function BookingPhoneMock() {
  return (
    <div className="rb-mock relative mx-auto w-full max-w-[260px]">
      <div className="rounded-[2rem] border border-slate-200/90 bg-slate-900 p-2.5 shadow-[0_28px_60px_rgb(15_23_42_/0.2)]">
        <div className="overflow-hidden rounded-[1.55rem] bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-center text-sm font-semibold text-ink">
              Meeting Details
            </p>
          </div>
          <div className="space-y-3 px-4 py-4">
            <div className="flex rounded-full bg-slate-100 p-0.5 text-[10px] font-semibold">
              <span className="flex-1 rounded-full bg-cobalt py-1.5 text-center text-white">
                External
              </span>
              <span className="flex-1 py-1.5 text-center text-slate-500">
                Internal
              </span>
            </div>
            {[
              ["Meeting Title", "Product sync"],
              ["Date", "21/1/2026"],
              ["Start → End", "5:08 PM → 6:08 PM"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] font-medium text-slate-400">{label}</p>
                <p className="mt-0.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-ink">
                  {value}
                </p>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                Available Rooms
              </p>
              <div className="mt-2 space-y-2">
                <div className="rounded-xl border border-cobalt/30 bg-cobalt/5 px-3 py-2">
                  <p className="text-xs font-semibold text-ink">Conference room</p>
                  <p className="text-[10px] text-slate-500">
                    Cap. 15 · Building A · 1st floor
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <p className="text-xs font-semibold text-ink">Meeting Room</p>
                  <p className="text-[10px] text-slate-500">
                    Cap. 6 · Building A · 2nd floor
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cobalt py-2.5 text-xs font-semibold text-white"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmartRoomBooking() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".rb-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="room-booking"
      ref={root}
      aria-labelledby="rb-title"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rb-reveal max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-cobalt uppercase">
            Key features
          </p>
          <h2
            id="rb-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Smart room booking with configurable governance
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Real-time availability plus daily limits, duration rules, and
            one-tap approvals — so premium rooms stay fair without slowing teams
            down.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="rb-reveal lg:sticky lg:top-28">
            <BookingPhoneMock />
          </div>

          <div className="space-y-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rb-reveal glass flex gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cobalt/10 text-cobalt">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {feature.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rb-reveal mt-14">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cobalt" />
            <h3 className="font-display text-lg font-bold text-ink">
              Why this matters
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyItMatters.map((item) => (
              <div
                key={item.title}
                className="glass-strong rounded-2xl border-l-4 border-l-cobalt p-6"
              >
                <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
