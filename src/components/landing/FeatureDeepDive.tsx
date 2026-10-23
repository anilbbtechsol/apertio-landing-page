"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  ClipboardList,
  DoorOpen,
  FileSpreadsheet,
  Fingerprint,
  MapPinned,
  QrCode,
  ShieldAlert,
  Timer,
  UserCheck,
  Users,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";
import { AdminDashboard } from "@/components/landing/AdminDashboard";
import { SmartRoomBooking } from "@/components/landing/SmartRoomBooking";
import { WaypointSystem } from "@/components/landing/WaypointSystem";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const visitJourney = [
  {
    step: "01",
    title: "Pre-register",
    text: "Guests submit identity, host, purpose, schedule, vehicle, and photo — duplicate and watchlist checks run at the door.",
  },
  {
    step: "02",
    title: "Host decide",
    text: "Approve, deny, or preapprove. Hosts can also book and share a pass without a public self-register path.",
  },
  {
    step: "03",
    title: "Issue pass",
    text: "Digital pass + QR via link, email, or WhatsApp. Optional branded printed gate pass for desk print.",
  },
  {
    step: "04",
    title: "Desk & wayfinding",
    text: "Lobby or gate modes: scan, check-in/out, deny, walk-in. Guide Me steps unlock after reception when configured.",
  },
] as const;

const visitCapabilities = [
  {
    icon: QrCode,
    title: "Public status & QR",
    text: "Login-less visitor pages for status tracking and entry credentials.",
  },
  {
    icon: UserCheck,
    title: "Host portal",
    text: "Pending queue, room booking, personal watchlist, print, and shift QR.",
  },
  {
    icon: Users,
    title: "Lobby & gate desks",
    text: "Shared presence API with site mode selecting reception vs security behaviors.",
  },
  {
    icon: MapPinned,
    title: "Live guest track",
    text: "On-site presence arc with wayfinding steps tied to check-in state.",
  },
] as const;

const accessBlocks = [
  {
    icon: CalendarClock,
    title: "Rooms & bookings",
    points: [
      "Capacity, floor, location, and buffers",
      "No double-book; extend when clear",
      "Internal meetings without public passes",
      "Token charge after free-room check",
    ],
  },
  {
    icon: DoorOpen,
    title: "Access profiles",
    points: [
      "Standard / VIP / Contractor presets",
      "ACS group IDs and area labels",
      "Assignable roles and require-before-check-in",
      "Subset-on-downgrade fallbacks",
    ],
  },
  {
    icon: Fingerprint,
    title: "Temporary credentials",
    points: [
      "Check-in provisions visitor identity",
      "Profile change updates groups live",
      "Check-out revokes / deactivates",
      "Server-side only — doors stay SoR",
    ],
  },
] as const;

const timeLanes = [
  {
    tier: "Foundation",
    title: "People & structure",
    items: [
      "Employee master with photo and org path",
      "Manager chain and direct-report scope",
      "Sections as attendance units",
      "One identity family with role grants",
    ],
  },
  {
    tier: "Time config",
    title: "Shifts & rules",
    items: [
      "Day / Night / Flexi shifts and rosters",
      "Holidays, weekly offs, rule categories",
      "Punch, OT, comp-off, late, round-up",
      "Rule preview before go-live",
    ],
  },
  {
    tier: "Live ops",
    title: "Punches & sheets",
    items: [
      "Webhook + poll punch ingestion",
      "Immediate DailyTimesheet recompute",
      "24h+ and cross-midnight correctness",
      "Employee live portal and admin views",
    ],
  },
  {
    tier: "Enterprise",
    title: "Exceptions & export",
    items: [
      "Exception queue and auto-absent sandwich",
      "OT / comp-off request and approve",
      "Section and hierarchy managers",
      "Payroll-ready CSV — export only",
    ],
  },
] as const;

const riskOps = [
  {
    icon: ShieldAlert,
    title: "Watchlists & blocklists",
    text: "Global banned lists, personal host lists, staff blocklist, and admin override with mandatory reason.",
  },
  {
    icon: Bell,
    title: "Notifications",
    text: "Email, WhatsApp, SMS with delivery log and retry — plus in-app reminders for visit and attendance events.",
  },
  {
    icon: ClipboardList,
    title: "Live dashboards",
    text: "Security presence KPIs, desk live lists, and section / employee attendance dashboards.",
  },
  {
    icon: FileSpreadsheet,
    title: "Reports & exports",
    text: "Visitor analytics and PDF/Excel security reports alongside scoped timesheet exports.",
  },
] as const;

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold tracking-[0.18em] text-cobalt uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{body}</p>
    </div>
  );
}

export function FeatureDeepDive() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".feature-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".journey-step").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          x: i % 2 === 0 ? -30 : 30,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="features" ref={root} className="relative py-8 sm:py-12">
      {/* Overview */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="feature-reveal">
          <SectionIntro
            eyebrow="Core capabilities"
            title="Deep dive into every pillar that runs the day"
            body="Visit, Access, Time, and Risk — expanded journeys and capability grids so operators see exactly what Apertio covers before a demo."
          />
        </div>

        <div className="feature-reveal mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: QrCode, label: "Visit & Host", hint: "Guests → passes → desks", href: "#visit" },
            { icon: DoorOpen, label: "Access & Space", hint: "Rooms → profiles → ACS", href: "#access" },
            { icon: Timer, label: "Time & People", hint: "Punches → rules → export", href: "#time" },
            { icon: ShieldAlert, label: "Risk & Ops", hint: "Watchlists → desks → exports", href: "#risk" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="glass group rounded-2xl p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cobalt text-white shadow-[0_10px_28px_rgb(37_99_235_/0.35)]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Visit */}
      <div id="visit" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="feature-reveal">
          <SectionIntro
            eyebrow="01 — Visit & Host"
            title="From pre-registration to gate pass"
            body="External guests move through a controlled lifecycle. Hosts and desks share one presence model with two site modes: lobby reception or security gate."
          />
        </div>

        <div className="relative mt-14">
          <div className="pointer-events-none absolute left-[1.15rem] top-2 bottom-2 w-px bg-gradient-to-b from-cobalt via-cobalt/30 to-transparent sm:left-1/2 sm:-translate-x-px" />
          <ol className="space-y-8">
            {visitJourney.map((item, i) => (
              <li
                key={item.step}
                className={`journey-step relative grid gap-4 sm:grid-cols-2 sm:gap-10 ${
                  i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div
                  className={`glass-strong rounded-2xl p-6 ${
                    i % 2 === 1 ? "sm:text-left" : "sm:text-right"
                  }`}
                >
                  <p className="font-display text-xs font-bold tracking-wider text-cobalt">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
                <div className="hidden sm:block" />
                <span className="absolute left-2 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-cobalt bg-white text-[10px] font-bold text-cobalt sm:left-1/2 sm:-translate-x-1/2">
                  {i + 1}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visitCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                whileHover={{ y: -4 }}
                className="feature-reveal glass rounded-2xl p-5"
              >
                <Icon className="h-5 w-5 text-cobalt" />
                <h4 className="mt-3 text-sm font-semibold text-ink">{cap.title}</h4>
                <p className="mt-1.5 text-sm text-slate-600">{cap.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Access */}
      <div id="access" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="feature-reveal">
          <SectionIntro
            eyebrow="02 — Access & Space"
            title="Rooms, profiles, temporary credentials"
            body="Bookable spaces and access profiles drive where people may go. Temporary door rights appear only while a visit is live — then revoke cleanly."
          />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {accessBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.title} className="feature-reveal glass-strong rounded-3xl p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cobalt/10 text-cobalt">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink">
                  {block.title}
                </h3>
                <ul className="mt-5 divide-y divide-slate-200/80">
                  {block.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 py-2.5 text-sm text-slate-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="feature-reveal glass mt-8 flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-cobalt" />
            <p className="text-sm font-medium text-ink">
              Live presence for occupied spaces — separate from employee attendance objects.
            </p>
          </div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Two presence domains
          </p>
        </div>
      </div>

      {/* Time */}
      <div id="time" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="feature-reveal">
          <SectionIntro
            eyebrow="03 — Time & People"
            title="Punches to payroll-ready sheets"
            body="Time & Attendance climbs from people foundation through live punches to enterprise exceptions — without a second parallel user table."
          />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {timeLanes.map((lane, i) => (
            <div
              key={lane.title}
              className="feature-reveal glass-strong relative overflow-hidden rounded-3xl p-6"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cobalt/10 blur-2xl" />
              <p className="text-[11px] font-semibold tracking-[0.16em] text-cobalt uppercase">
                {lane.tier}
              </p>
              <h3 className="font-display mt-2 text-xl font-bold text-ink">
                {lane.title}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {lane.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-600">
                    <span className="font-display text-xs font-bold text-cobalt/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Risk & Ops */}
      <div id="risk" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="feature-reveal">
          <SectionIntro
            eyebrow="04 — Risk & Ops"
            title="Controls that keep visits and attendance auditable"
            body="Watchlists, notifications, live desks, and exports sit across modules — so security and HR share the same operational truth."
          />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {riskOps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="feature-reveal glass group flex gap-4 rounded-2xl p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cobalt text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supporting deep-dives after the four pillars */}
      <WaypointSystem />
      <SmartRoomBooking />
      <AdminDashboard />
    </section>
  );
}
