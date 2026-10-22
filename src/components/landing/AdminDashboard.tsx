"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Building2,
  CalendarDays,
  ChartColumn,
  Coins,
  Settings2,
  Users,
  DoorOpen,
  Bookmark,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const modules = [
  { icon: DoorOpen, label: "Room Management", hint: "Create & manage meeting spaces" },
  { icon: Users, label: "User Management", hint: "Add users & assign roles" },
  { icon: Coins, label: "Departments & Tokens", hint: "Allocate tokens & budgets" },
  { icon: Building2, label: "Setup Organization", hint: "Configure company profile" },
  { icon: CalendarDays, label: "Book Room", hint: "Schedule meetings & events" },
  { icon: Settings2, label: "Settings", hint: "System preferences" },
  { icon: Bookmark, label: "My Bookings", hint: "Your upcoming spaces" },
  { icon: ChartColumn, label: "Analytics", hint: "Usage & trends" },
] as const;

const benefits: {
  accent: string;
  bar: string;
  icon: LucideIcon;
  title: string;
  text: string;
}[] = [
  {
    accent: "bg-slate-800",
    bar: "bg-slate-800",
    icon: UserCog,
    title: "Room and User Management",
    text: "Create, edit, and manage rooms with capacity and amenities. Assign roles: Admin, Host, Receptionist.",
  },
  {
    accent: "bg-cobalt",
    bar: "bg-cobalt",
    icon: Coins,
    title: "Department & Token Management",
    text: "Budget allocation and usage tracking so departments spend within clear limits.",
  },
  {
    accent: "bg-orange-500",
    bar: "bg-orange-500",
    icon: Settings2,
    title: "Organization Settings & System Health",
    text: "Google Calendar integration and preferences — with data integrity and maintenance in view.",
  },
];

function AdminPhoneMock() {
  return (
    <div className="ad-mock relative mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border border-slate-200/90 bg-slate-900 p-2.5 shadow-[0_28px_60px_rgb(15_23_42_/0.2)]">
        <div className="overflow-hidden rounded-[1.55rem] bg-[#f0f4fa]">
          <div className="px-4 pt-4 pb-2">
            <p className="text-sm font-semibold text-ink">Admin Dashboard</p>
            <p className="text-[10px] text-slate-500">Complete visibility & control</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 px-3 pb-4">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.label}
                  className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt/10 text-cobalt">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 truncate text-[11px] font-semibold text-ink">
                    {mod.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-slate-500">
                    {mod.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".ad-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });

      gsap.from(".ad-benefit", {
        opacity: 0,
        x: 28,
        stagger: 0.12,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".ad-benefits",
          start: "top 82%",
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="admin"
      ref={root}
      aria-labelledby="ad-title"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="ad-reveal max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-cobalt uppercase">
            Key benefits · Admin dashboard
          </p>
          <h2
            id="ad-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Operators run rooms, people, and budgets from one place
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Administrators configure spaces, roles, tokens, and integrations —
            with full visibility across the organization.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="ad-reveal">
            <AdminPhoneMock />
          </div>

          <div className="ad-benefits space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="ad-benefit glass-strong relative overflow-hidden rounded-2xl p-6"
                >
                  <div className={`mb-4 h-1 w-16 rounded-full ${benefit.bar}`} />
                  <div className="flex gap-4">
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${benefit.accent} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">
                        {benefit.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {benefit.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
