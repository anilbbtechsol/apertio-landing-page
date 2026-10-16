"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  BadgeCheck,
  Ban,
  Bell,
  Briefcase,
  CalendarClock,
  Camera,
  Car,
  Check,
  CircleX,
  ClipboardList,
  Copy,
  CopyX,
  FileText,
  IdCard,
  Link2,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Minus,
  Navigation,
  Phone,
  QrCode,
  ScanLine,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type VisitType = "external" | "internal";

const order: VisitType[] = ["external", "internal"];

/* Literal class strings per accent so Tailwind can see them. */
const accent = {
  external: {
    text: "text-vt-ext",
    bg: "bg-vt-ext",
    soft: "bg-vt-ext-soft",
    border: "border-vt-ext",
    borderSoft: "border-vt-ext/30",
  },
  internal: {
    text: "text-vt-int",
    bg: "bg-vt-int",
    soft: "bg-vt-int-soft",
    border: "border-vt-int",
    borderSoft: "border-vt-int/30",
  },
} as const;

type Item = { icon: LucideIcon; text: string; tag?: string; soon?: boolean };

/*
 * `soon: true` marks items still marked [CONFIRM] by product.
 * Flip to false (or delete the flag) once shipped and the badge disappears.
 */
const visitTypes: Record<
  VisitType,
  {
    label: string;
    people: string;
    icon: LucideIcon;
    summary: string;
    whoFor: string;
    bestFor: string[];
    hostCaptures: Item[];
    deskCaptures?: Item[];
    does: Item[];
  }
> = {
  external: {
    label: "External",
    people: "Guests",
    icon: UserRound,
    summary: "Guests get a digital pass, QR and gate-desk check-in.",
    whoFor:
      "Clients, candidates, vendors and other outside guests who need controlled entry.",
    bestFor: ["Client meetings", "Interviews", "Vendor visits", "Campus guests"],
    hostCaptures: [
      { icon: UserRound, text: "Name" },
      { icon: Mail, text: "Email" },
      { icon: Phone, text: "Phone" },
      { icon: Car, text: "Vehicle type", tag: "Optional" },
      { icon: IdCard, text: "Number plate", tag: "Optional" },
    ],
    deskCaptures: [{ icon: Camera, text: "Visitor photo" }],
    does: [
      {
        icon: ShieldCheck,
        text: "Host approves, denies or preapproves; watchlist check blocks flagged names",
      },
      {
        icon: CopyX,
        text: "Same-day duplicate visits are rejected with a link to the existing visit",
      },
      {
        icon: QrCode,
        text: "Issues a per-guest digital pass + QR via status link, email or WhatsApp",
      },
      {
        icon: Link2,
        text: "Guest opens a login-less status page (no staff account needed)",
      },
      {
        icon: ScanLine,
        text: "Gate desk: search the live list, check-in / check-out / deny, print pass",
      },
      { icon: Bell, text: "Host gets arrival and departure notifications" },
      { icon: Navigation, text: "Optional “Guide Me” indoor steps after check-in" },
      { icon: FileText, text: "Vehicle details included in the daily security PDF" },
    ],
  },
  internal: {
    label: "Internal",
    people: "Members",
    icon: Briefcase,
    summary: "Members are logged with Employee IDs for audit, with no visitor pass.",
    whoFor: "Employees visiting for team work, with no external guests involved.",
    bestFor: ["Standups", "Internal reviews", "Department workshops"],
    hostCaptures: [
      { icon: UserRound, text: "Name" },
      { icon: Mail, text: "Email" },
      { icon: Phone, text: "Phone" },
      { icon: IdCard, text: "Employee ID", tag: "Required, for audit" },
    ],
    does: [
      { icon: Users, text: "Treats people as “Members”, not “Guests”" },
      { icon: Ban, text: "No visitor pass, no QR share flow" },
      { icon: ShieldCheck, text: "Same host decision, notifications and audit trail" },
      {
        icon: ClipboardList,
        text: "Visit is listed with member names and Employee IDs for reporting",
      },
      { icon: ScanLine, text: "Appears on the gate-desk live list", soon: true },
    ],
  },
};

type Step = {
  icon: LucideIcon;
  label: string;
  text: string;
  skipped?: boolean;
};

const lifecycle: Record<
  VisitType,
  { title: string; note: string; steps: Step[]; denied: string }
> = {
  external: {
    title: "Full lifecycle",
    note: "Every step, with pass and gate desk",
    steps: [
      {
        icon: CalendarClock,
        label: "Expected",
        text: "Host pre-registers; duplicate and watchlist checks run",
      },
      { icon: BadgeCheck, label: "Approved", text: "Host approves; pass + QR issued" },
      { icon: LogIn, label: "Inside", text: "Checked in at the gate desk; host notified" },
      { icon: LogOut, label: "Checked out", text: "Desk checks out; host notified" },
    ],
    denied: "Host or desk denies, or a watchlist match blocks entry",
  },
  internal: {
    title: "Lighter lifecycle",
    note: "No pass, no gate-desk step",
    steps: [
      {
        icon: CalendarClock,
        label: "Expected",
        text: "Members logged with Employee IDs",
      },
      { icon: BadgeCheck, label: "Approved", text: "Same host decision; no pass issued" },
      { icon: LogIn, label: "Inside", text: "No gate-desk check-in", skipped: true },
      { icon: LogOut, label: "Checked out", text: "Listed for audit only", skipped: true },
    ],
    denied: "Host denies; recorded in the audit trail",
  },
};

type Cell =
  | { kind: "yes"; label?: string }
  | { kind: "no"; label?: string }
  | { kind: "text"; label: string }
  | { kind: "soon" };

const comparison: { label: string; external: Cell; internal: Cell }[] = [
  {
    label: "Who",
    external: { kind: "text", label: "Outside guests" },
    internal: { kind: "text", label: "Employees / members" },
  },
  {
    label: "UI label",
    external: { kind: "text", label: "Guests" },
    internal: { kind: "text", label: "Members" },
  },
  {
    label: "Identity extras",
    external: { kind: "text", label: "Photo, vehicle" },
    internal: { kind: "text", label: "Employee ID" },
  },
  { label: "Digital QR pass", external: { kind: "yes" }, internal: { kind: "no" } },
  {
    label: "Gate-desk check-in",
    external: { kind: "yes" },
    internal: { kind: "no", label: "No visitor pass" },
  },
  { label: "Watchlist check", external: { kind: "yes" }, internal: { kind: "soon" } },
  { label: "Host approval", external: { kind: "yes" }, internal: { kind: "yes" } },
  {
    label: "Notifications (email / WhatsApp)",
    external: { kind: "yes" },
    internal: { kind: "yes" },
  },
  {
    label: "Live tracking",
    external: { kind: "yes", label: "Full lifecycle" },
    internal: { kind: "text", label: "Listed only" },
  },
  {
    label: "Security PDF",
    external: { kind: "yes", label: "Included" },
    internal: { kind: "no", label: "Skipped" },
  },
  { label: "Reports and exports", external: { kind: "yes" }, internal: { kind: "yes" } },
];

const blurb =
  "Toggle External or Internal when creating a visit. External guests get passes, desk check-in, host alerts and live tracking. Internal members are captured with Employee IDs under the same audit trail, with no visitor passes. Reception only sees the guests who need a gate.";

/* Without JS: hide the toggle and show both panels stacked. */
const noJsCss =
  "<style>.visit-types [data-vt-panel]{display:block!important}.visit-types .vt-js-only{display:none!important}</style>";

const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vt-eyebrow";

/* ---------- small pieces ---------- */

function ComingSoon() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-vt-soon/30 bg-vt-soon-soft px-2 py-0.5 text-[11px] font-semibold tracking-wide text-vt-soon">
      Coming soon
    </span>
  );
}

function TypeChip({ type }: { type: VisitType }) {
  const t = visitTypes[type];
  const a = accent[type];
  const Icon = t.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        a.soft,
        a.text,
        a.borderSoft,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {t.label}
      <span className="font-medium opacity-90">· {t.people}</span>
    </span>
  );
}

function CellValue({ cell, type }: { cell: Cell; type: VisitType }) {
  if (cell.kind === "soon") return <ComingSoon />;
  if (cell.kind === "text")
    return <span className="text-sm text-vt-ink">{cell.label}</span>;
  if (cell.kind === "yes")
    return (
      <span className="inline-flex items-center gap-2 text-sm text-vt-ink">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full",
            accent[type].soft,
            accent[type].text,
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </span>
        {cell.label ?? "Yes"}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-2 text-sm text-vt-muted">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-vt-border">
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </span>
      {cell.label ?? "No"}
    </span>
  );
}

function Checklist({ items, type }: { items: Item[]; type: VisitType }) {
  const a = accent[type];
  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.text} className="vt-item flex items-start gap-3 text-sm text-vt-body">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                a.soft,
                a.text,
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
              {item.text}
              {item.tag ? (
                <span className="rounded-md border border-vt-border px-1.5 py-px text-[11px] font-medium text-vt-muted">
                  {item.tag}
                </span>
              ) : null}
              {item.soon ? <ComingSoon /> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function BlockTitle({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <h4 className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-vt-muted uppercase">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </h4>
  );
}

/* Deterministic QR-like matrix (decorative) so SSR and client match. */
const QR_SIZE = 21;
const qrCells = (() => {
  const cells: [number, number][] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (inFinder(x, y)) continue;
      if (y === 6 || x === 6) {
        if ((x + y) % 2 === 0) cells.push([x, y]);
        continue;
      }
      if (rand() > 0.52) cells.push([x, y]);
    }
  }
  return cells;
})();

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} fill="#0a0f1c" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#0a0f1c" />
    </g>
  );
}

function QrMock() {
  return (
    <svg
      viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`}
      className="h-full w-full"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <rect x={-1} y={-1} width={QR_SIZE + 2} height={QR_SIZE + 2} fill="#fff" />
      {qrCells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0a0f1c" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={14} y={0} />
      <Finder x={0} y={14} />
    </svg>
  );
}

function StatusChip({ type, label }: { type: VisitType; label: string }) {
  const reduce = useReducedMotion();
  const a = accent[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        a.soft,
        a.text,
        a.borderSoft,
      )}
    >
      <motion.span
        className={cn("h-1.5 w-1.5 rounded-full", a.bg)}
        animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      {label}
    </span>
  );
}

function MockRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-xs text-vt-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-vt-ink">{children}</dd>
    </div>
  );
}

function ExternalPassMock() {
  return (
    <figure className="vt-mock relative">
      <div
        className="absolute inset-x-6 -bottom-2 h-full rounded-[1rem] border border-vt-border bg-vt-card-soft"
        aria-hidden
      />
      <div className="relative rounded-[1rem] border border-vt-border bg-vt-card p-5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-vt-muted uppercase">
            Visitor pass
          </p>
          <StatusChip type="external" label="Approved" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-28 w-28 shrink-0 rounded-[0.75rem] border border-vt-border bg-white p-2">
            <QrMock />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-vt-ink">Priya Nair</p>
            <p className="text-sm text-vt-body">Client meeting</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-vt-ext">
              <QrCode className="h-3.5 w-3.5" aria-hidden />
              Show QR at the gate desk
            </p>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-vt-border border-t border-vt-border">
          <MockRow label="Host">Arjun Mehta</MockRow>
          <MockRow label="When">Today · 10:30</MockRow>
          <MockRow label="Vehicle">
            <span className="inline-flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-vt-muted" aria-hidden />
              Car · MH 01 AB 1234
            </span>
          </MockRow>
          <MockRow label="Photo">
            <span className="inline-flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-vt-muted" aria-hidden />
              Captured at desk
            </span>
          </MockRow>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { icon: Link2, label: "Status link" },
            { icon: Mail, label: "Email" },
            { icon: MessageCircle, label: "WhatsApp" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-vt-border px-2.5 py-1 text-xs text-vt-body"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="sr-only">
        Example external visitor pass with a QR code and Approved status.
      </figcaption>
    </figure>
  );
}

function InternalEntryMock() {
  const members = [
    { name: "Rahul Desai", id: "EMP-20417" },
    { name: "Meera Iyer", id: "EMP-18832" },
  ];
  return (
    <figure className="vt-mock relative">
      <div
        className="absolute inset-x-6 -bottom-2 h-full rounded-[1rem] border border-vt-border bg-vt-card-soft"
        aria-hidden
      />
      <div className="relative rounded-[1rem] border border-vt-border bg-vt-card p-5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-vt-muted uppercase">
            Member entry
          </p>
          <StatusChip type="internal" label="Approved" />
        </div>

        <p className="font-display mt-4 text-lg font-bold text-vt-ink">Q4 roadmap review</p>
        <p className="text-sm text-vt-body">Host: Arjun Mehta · Today · 14:00</p>

        <div className="mt-4 space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="rounded-[0.75rem] border border-vt-border bg-vt-card-soft p-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vt-int-soft text-xs font-bold text-vt-int">
                  {m.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-vt-ink">{m.name}</p>
                  <p className="text-xs text-vt-muted">Member</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="flex items-center justify-between text-[11px] font-medium text-vt-muted">
                  <span>
                    Employee ID <span className="text-vt-int">*</span>
                  </span>
                  <span>Required</span>
                </p>
                <p className="mt-1 flex items-center gap-2 rounded-lg border border-vt-int/40 px-3 py-2 font-mono text-sm text-vt-ink">
                  <IdCard className="h-4 w-4 text-vt-int" aria-hidden />
                  {m.id}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2 rounded-[0.75rem] border border-dashed border-vt-border px-3 py-2.5 text-xs text-vt-body">
          <Ban className="h-4 w-4 shrink-0 text-vt-muted" aria-hidden />
          No visitor pass · No QR. Logged for audit.
        </p>
      </div>
      <figcaption className="sr-only">
        Example internal member entry with Employee IDs and no QR code.
      </figcaption>
    </figure>
  );
}

/* ---------- panel ---------- */

function DetailPanel({ type, active }: { type: VisitType; active: boolean }) {
  const t = visitTypes[type];
  const a = accent[type];
  return (
    <div
      id={`vt-panel-${type}`}
      role="tabpanel"
      aria-labelledby={`vt-tab-${type}`}
      tabIndex={0}
      data-vt-panel
      className={cn(
        "rounded-[1rem] border border-vt-border bg-vt-card p-5 backdrop-blur-md sm:p-8",
        focusRing,
        !active && "hidden",
      )}
    >
      <div className="vt-item flex flex-wrap items-center gap-3">
        <TypeChip type={type} />
        <h3 className="font-display text-xl font-bold text-vt-ink sm:text-2xl">
          {t.label} visit
        </h3>
      </div>
      <p className="vt-item mt-2 text-sm text-vt-body sm:text-base">{t.summary}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="vt-item">
              <BlockTitle icon={Users}>Who it&apos;s for</BlockTitle>
              <p className="mt-3 text-sm leading-relaxed text-vt-body">{t.whoFor}</p>
              <p className="mt-4 text-xs font-semibold text-vt-ink">Best for</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {t.bestFor.map((b) => (
                  <li
                    key={b}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium text-vt-ink",
                      a.borderSoft,
                    )}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="vt-item">
              <BlockTitle icon={ClipboardList}>What the host captures</BlockTitle>
              <div className="mt-3">
                <Checklist items={t.hostCaptures} type={type} />
              </div>
              {t.deskCaptures ? (
                <>
                  <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-vt-ink">
                    <ScanLine className="h-3.5 w-3.5" aria-hidden />
                    Gate desk captures
                  </p>
                  <div className="mt-2.5">
                    <Checklist items={t.deskCaptures} type={type} />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="vt-item border-t border-vt-border pt-8">
            <BlockTitle icon={ShieldCheck}>What Apertio does</BlockTitle>
            <div className="mt-4">
              <Checklist items={t.does} type={type} />
            </div>
          </div>
        </div>

        <div className="vt-item lg:sticky lg:top-28 lg:self-start">
          {type === "external" ? <ExternalPassMock /> : <InternalEntryMock />}
        </div>
      </div>
    </div>
  );
}

/* ---------- lifecycle ---------- */

function LifecycleLane({ type, active }: { type: VisitType; active: boolean }) {
  const lane = lifecycle[type];
  const a = accent[type];
  const last = lane.steps.length - 1;
  return (
    <div
      className={cn(
        "vt-lane rounded-[1rem] border p-5 transition-colors duration-300 sm:p-6",
        active ? cn(a.borderSoft, "bg-vt-card") : "border-vt-border bg-vt-card-soft",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <TypeChip type={type} />
          <p className="text-sm font-semibold text-vt-ink">{lane.title}</p>
        </div>
        <p className="text-xs text-vt-muted">{lane.note}</p>
      </div>

      <ol className="mt-6 grid md:grid-cols-4">
        {lane.steps.map((step, i) => {
          const Icon = step.skipped ? Minus : step.icon;
          const next = lane.steps[i + 1];
          const segmentDone = next && !next.skipped && !step.skipped;
          return (
            <li
              key={step.label}
              className="vt-step relative flex gap-4 pb-7 last:pb-0 md:flex-col md:items-center md:px-3 md:pb-0 md:text-center"
            >
              {i < last ? (
                <>
                  <span
                    aria-hidden
                    className="absolute top-11 -bottom-0.5 left-[17px] w-0 border-l-2 border-dashed border-vt-border md:top-[17px] md:bottom-auto md:left-[calc(50%+26px)] md:h-0 md:w-[calc(100%-52px)] md:border-t-2 md:border-l-0"
                  />
                  {segmentDone ? (
                    <span
                      aria-hidden
                      className={cn(
                        "vt-seg absolute top-11 -bottom-0.5 left-[17px] w-0.5 origin-top md:top-[17px] md:bottom-auto md:left-[calc(50%+26px)] md:h-0.5 md:w-[calc(100%-52px)] md:origin-left",
                        a.bg,
                      )}
                    />
                  ) : null}
                </>
              ) : null}

              <span
                className={cn(
                  "vt-node relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  step.skipped
                    ? "border-2 border-dashed border-vt-border bg-vt-card text-vt-muted"
                    : cn(a.bg, "text-vt-on-accent"),
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>

              <div className="min-w-0 md:mt-3">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-vt-ink md:justify-center">
                  {step.label}
                  {step.skipped ? (
                    <span className="rounded-md border border-vt-border px-1.5 py-px text-[11px] font-medium text-vt-muted">
                      Skipped
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-vt-body">{step.text}</p>

                {step.label === "Approved" ? (
                  <div className="mt-3 md:flex md:flex-col md:items-center">
                    <span
                      aria-hidden
                      className="mx-auto hidden h-4 w-0 border-l border-dashed border-vt-deny/50 md:block"
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-vt-deny/30 bg-vt-deny-soft px-2.5 py-1 text-xs font-semibold text-vt-deny">
                      <CircleX className="h-3.5 w-3.5" aria-hidden />
                      Or: Denied
                    </span>
                    <p className="mt-1.5 text-xs leading-relaxed text-vt-muted">
                      {lane.denied}
                    </p>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- comparison ---------- */

function ComparisonTable() {
  return (
    <>
      <div className="vt-reveal hidden overflow-hidden rounded-[1rem] border border-vt-border bg-vt-card backdrop-blur-md md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">External versus Internal visits</caption>
          <thead>
            <tr className="border-b border-vt-border">
              <th scope="col" className="w-[34%] px-6 py-4 text-xs font-semibold tracking-[0.14em] text-vt-muted uppercase">
                Capability
              </th>
              <th scope="col" className="px-6 py-4">
                <TypeChip type="external" />
              </th>
              <th scope="col" className="px-6 py-4">
                <TypeChip type="internal" />
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.label} className="vt-row border-b border-vt-border last:border-b-0">
                <th scope="row" className="px-6 py-3.5 text-sm font-medium text-vt-ink">
                  {row.label}
                </th>
                <td className="px-6 py-3.5">
                  <CellValue cell={row.external} type="external" />
                </td>
                <td className="px-6 py-3.5">
                  <CellValue cell={row.internal} type="internal" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="External versus Internal visits">
        {comparison.map((row) => (
          <li
            key={row.label}
            className="vt-row rounded-[0.875rem] border border-vt-border bg-vt-card p-4"
          >
            <p className="text-sm font-semibold text-vt-ink">{row.label}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              {order.map((type) => (
                <div key={type}>
                  <dt className={cn("text-[11px] font-semibold tracking-wide uppercase", accent[type].text)}>
                    {visitTypes[type].label}
                  </dt>
                  <dd className="mt-1">
                    <CellValue cell={row[type]} type={type} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- callout ---------- */

function Callout() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(blurb);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — text stays selectable */
    }
  };

  return (
    <div className="vt-callout flex flex-col gap-4 rounded-[1rem] border border-vt-border bg-vt-card p-5 backdrop-blur-md sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="flex gap-4">
        <div className="flex shrink-0 gap-1" aria-hidden>
          <span className="h-full w-1 rounded-full bg-vt-ext" />
          <span className="h-full w-1 rounded-full bg-vt-int" />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-vt-muted uppercase">
            In one line
          </p>
          <p className="mt-2 text-sm leading-relaxed text-vt-ink sm:text-base">{blurb}</p>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={copy}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "vt-js-only inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-vt-border px-3.5 py-2 text-xs font-semibold text-vt-ink transition-colors hover:bg-vt-card-soft",
          focusRing,
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        <span aria-live="polite">{copied ? "Copied" : "Copy blurb"}</span>
      </motion.button>
    </div>
  );
}

/* ---------- section ---------- */

export function VisitTypes() {
  const root = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<VisitType>("external");
  const prevActive = useRef<VisitType>(active);

  const select = (index: number) => {
    setActive(order[index]);
    tabRefs.current[index]?.focus();
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const map: Record<string, number> = {
      ArrowRight: (index + 1) % order.length,
      ArrowDown: (index + 1) % order.length,
      ArrowLeft: (index - 1 + order.length) % order.length,
      ArrowUp: (index - 1 + order.length) % order.length,
      Home: 0,
      End: order.length - 1,
    };
    if (!(event.key in map)) return;
    event.preventDefault();
    select(map[event.key]);
  };

  // Re-animate the panel contents on switch; refresh triggers since panel heights differ.
  useEffect(() => {
    if (prevActive.current === active) return;
    prevActive.current = active;
    ScrollTrigger.refresh();
    if (prefersReducedMotion()) return;
    const panel = root.current?.querySelector(`#vt-panel-${active}`);
    if (!panel) return;
    const tween = gsap.fromTo(
      panel.querySelectorAll(".vt-item"),
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.04,
        clearProps: "opacity,transform",
      },
    );
    return () => {
      tween.kill();
    };
  }, [active]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".vt-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".vt-lane").forEach((lane) => {
        gsap.from(lane.querySelectorAll(".vt-node"), {
          scale: 0.5,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.12,
          scrollTrigger: { trigger: lane, start: "top 82%" },
        });
      });

      gsap.from(".vt-row", {
        opacity: 0,
        x: -14,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.04,
        scrollTrigger: { trigger: ".vt-compare", start: "top 80%" },
      });

      gsap.from(".vt-callout", {
        opacity: 0,
        scale: 0.97,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ".vt-callout", start: "top 90%" },
      });

      const mm = gsap.matchMedia();

      // Desktop: segments draw horizontally with scroll; pass card drifts slightly.
      mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>(".vt-lane").forEach((lane) => {
          gsap.fromTo(
            lane.querySelectorAll(".vt-seg"),
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              stagger: 0.5,
              scrollTrigger: {
                trigger: lane,
                start: "top 85%",
                end: "top 40%",
                scrub: 0.6,
              },
            },
          );
        });
      });

      mm.add("(min-width: 1024px)", () => {
        gsap.utils.toArray<HTMLElement>(".vt-mock").forEach((card) => {
          gsap.fromTo(
            card,
            { y: 28 },
            {
              y: -12,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      });

      // Mobile: segments draw vertically.
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>(".vt-seg").forEach((seg) => {
          gsap.fromTo(
            seg,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: seg,
                start: "top 85%",
                end: "bottom 60%",
                scrub: 0.6,
              },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="visit-types"
      ref={root}
      aria-labelledby="vt-title"
      className="visit-types relative bg-vt-bg"
    >
      <noscript dangerouslySetInnerHTML={{ __html: noJsCss }} />

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        {/* 1. Header */}
        <div className="vt-reveal max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-vt-eyebrow uppercase">
            Visit types
          </p>
          <h2
            id="vt-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-vt-ink sm:text-4xl"
          >
            Two visit types. One access model.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-vt-body sm:text-base">
            Every visit starts the same way: a host, a time, the people coming. It
            then splits by who is arriving. External guests get a digital pass and
            gate-desk check-in. Internal members are logged for audit, with no
            visitor-pass overhead.
          </p>
        </div>

        {/* 2. Toggle */}
        <div className="vt-reveal vt-js-only mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div
            role="tablist"
            aria-label="Visit type"
            className="inline-flex self-start rounded-full border border-vt-border bg-vt-card p-1 backdrop-blur-md"
          >
            {order.map((type, i) => {
              const t = visitTypes[type];
              const Icon = t.icon;
              const selected = active === type;
              return (
                <button
                  key={type}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`vt-tab-${type}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`vt-panel-${type}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(type)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5",
                    focusRing,
                    selected ? "text-vt-on-accent" : "text-vt-body hover:text-vt-ink",
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="vt-toggle-pill"
                      className={cn("absolute inset-0 rounded-full", accent[type].bg)}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden />
                    {t.label}
                    <span className="hidden font-medium opacity-90 sm:inline">
                      · {t.people}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-vt-muted" aria-live="polite">
            {visitTypes[active].summary}
          </p>
        </div>

        {/* 3. Detail panel(s) */}
        <div className="vt-reveal mt-6 space-y-6">
          {order.map((type) => (
            <DetailPanel key={type} type={type} active={active === type} />
          ))}
        </div>

        {/* 4. Lifecycle strip */}
        <div className="mt-16">
          <div className="vt-reveal flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-vt-ink sm:text-2xl">
                Visit lifecycle
              </h3>
              <p className="mt-1 text-sm text-vt-body">
                Expected → Approved → Inside → Checked out, with Denied as a branch.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {order.map((type) => (
              <LifecycleLane key={type} type={type} active={active === type} />
            ))}
          </div>
        </div>

        {/* 5. Comparison */}
        <div className="vt-compare mt-16">
          <div className="vt-reveal mb-6">
            <h3 className="font-display text-xl font-bold text-vt-ink sm:text-2xl">
              Side by side
            </h3>
            <p className="mt-1 text-sm text-vt-body">
              What changes, and what stays the same, between the two visit types.
            </p>
          </div>
          <ComparisonTable />
        </div>

        {/* 6. Callout */}
        <div className="mt-10">
          <Callout />
        </div>
      </div>
    </section>
  );
}
