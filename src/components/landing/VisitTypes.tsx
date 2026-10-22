"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Ban,
  Bell,
  Briefcase,
  Camera,
  Car,
  ClipboardList,
  CopyX,
  FileText,
  IdCard,
  Link2,
  Mail,
  MessageCircle,
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
      { icon: ShieldCheck, text: "Host approves or denies. Watchlist blocks flagged names." },
      { icon: CopyX, text: "Same-day duplicates are rejected." },
      { icon: QrCode, text: "Sends a pass and QR by link, email, or WhatsApp." },
      { icon: ScanLine, text: "Gate desk checks people in and prints a pass." },
      { icon: Bell, text: "Host is notified on arrival and departure." },
      { icon: Navigation, text: "Optional indoor directions after check-in." },
      { icon: FileText, text: "Vehicle details go in the daily security PDF." },
    ],
  },
  internal: {
    label: "Internal",
    people: "Members",
    icon: Briefcase,
    summary: "Members are logged with Employee IDs for audit, with no visitor pass.",
    whoFor: "",
    bestFor: ["Standups", "Internal reviews", "Department workshops"],
    hostCaptures: [],
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

const internalFeatures: {
  icon: LucideIcon;
  title: string;
  text: string;
  soon?: boolean;
}[] = [
  {
    icon: Users,
    title: "Members, not guests",
    text: "People are treated as Members — the right model for employees on site for team work.",
  },
  {
    icon: Ban,
    title: "No pass or QR",
    text: "Skip visitor passes and QR share flows. Entry is logged for audit without guest credentials.",
  },
  {
    icon: ShieldCheck,
    title: "Same host controls",
    text: "Approve, deny, and notify as usual — with a full audit trail on every decision.",
  },
  {
    icon: IdCard,
    title: "Employee ID reporting",
    text: "Visits list member names and Employee IDs so security and HR can report cleanly.",
  },
  {
    icon: ScanLine,
    title: "Gate-desk live list",
    text: "Internal visits appear on the gate-desk live list alongside other presence.",
    soon: true,
  },
];

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

/* ---------- panel ---------- */

function InternalFeaturesPanel({ active }: { active: boolean }) {
  const t = visitTypes.internal;
  return (
    <div
      id="vt-panel-internal"
      role="tabpanel"
      aria-labelledby="vt-tab-internal"
      tabIndex={0}
      data-vt-panel
      className={cn(
        "rounded-[1rem] border border-vt-border bg-vt-card p-5 backdrop-blur-md sm:p-8",
        focusRing,
        !active && "hidden",
      )}
    >
      <div className="vt-item flex flex-wrap items-start justify-between gap-4">
        <div>
          <TypeChip type="internal" />
          <p className="mt-2 max-w-xl text-sm text-vt-body sm:text-base">{t.summary}</p>
        </div>
        <ul className="vt-item flex flex-wrap gap-2">
          {t.bestFor.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-vt-int/25 bg-vt-int-soft px-2.5 py-1 text-xs font-medium text-vt-int"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="vt-item mt-6 flex flex-wrap items-center gap-3 rounded-[0.75rem] border border-dashed border-vt-int/30 bg-vt-int-soft/50 px-4 py-3 text-sm text-vt-body">
        <Ban className="h-4 w-4 shrink-0 text-vt-int" aria-hidden />
        <span>
          <span className="font-semibold text-vt-ink">No visitor pass · No QR</span>
          {" — "}
          logged with Employee IDs for audit.
        </span>
      </div>

      <div className="vt-item mt-8">
        <BlockTitle icon={ShieldCheck}>Key features</BlockTitle>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {internalFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className={cn(
                  "relative flex flex-col rounded-[0.75rem] border border-vt-border bg-vt-card-soft p-5 transition-transform hover:-translate-y-0.5",
                  i === internalFeatures.length - 1 && "sm:col-span-2 lg:col-span-1",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vt-int text-white shadow-[0_8px_20px_rgb(79_70_229_/0.28)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-display text-[11px] font-bold tracking-wider text-vt-int/70">
                    0{i + 1}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-vt-ink">{item.title}</h4>
                  {item.soon ? <ComingSoon /> : null}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-vt-body">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DetailPanel({ type, active }: { type: VisitType; active: boolean }) {
  if (type === "internal") {
    return <InternalFeaturesPanel active={active} />;
  }

  const t = visitTypes.external;
  const a = accent.external;
  return (
    <div
      id="vt-panel-external"
      role="tabpanel"
      aria-labelledby="vt-tab-external"
      tabIndex={0}
      data-vt-panel
      className={cn(
        "rounded-[1rem] border border-vt-border bg-vt-card p-5 backdrop-blur-md sm:p-8",
        focusRing,
        !active && "hidden",
      )}
    >
      <div className="vt-item">
        <TypeChip type="external" />
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
                <Checklist items={t.hostCaptures} type="external" />
              </div>
              {t.deskCaptures ? (
                <>
                  <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-vt-ink">
                    <ScanLine className="h-3.5 w-3.5" aria-hidden />
                    Gate desk captures
                  </p>
                  <div className="mt-2.5">
                    <Checklist items={t.deskCaptures} type="external" />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="vt-item border-t border-vt-border pt-8">
            <BlockTitle icon={ShieldCheck}>How it works</BlockTitle>
            <div className="mt-4">
              <Checklist items={t.does} type="external" />
            </div>
          </div>
        </div>

        <div className="vt-item lg:sticky lg:top-28 lg:self-start">
          <ExternalPassMock />
        </div>
      </div>
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

      const mm = gsap.matchMedia();

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
            Visitors
          </p>
          <h2
            id="vt-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-vt-ink sm:text-4xl"
          >
            Two visit types. One access model.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-vt-body sm:text-base">
            Hosts create a visit once — people, time, and purpose. From there the
            path depends on who is arriving: external guests receive a digital pass
            and check in at the gate desk; internal members are recorded for audit
            without pass or desk overhead.
          </p>
        </div>

        {/* 2. Toggle */}
        <div className="vt-reveal vt-js-only mt-10">
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
        </div>

        {/* 3. Detail panel(s) */}
        <div className="vt-reveal mt-6 space-y-6">
          {order.map((type) => (
            <DetailPanel key={type} type={type} active={active === type} />
          ))}
        </div>
      </div>
    </section>
  );
}
