"use client";

import { motion } from "framer-motion";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { formatNumber, formatPercent } from "@/lib/format";
import {
  attendanceSeries,
  kpiSparkPresence,
  kpiSparkShowRate,
  kpiSparkVisitors,
  visitorSeries,
} from "@/lib/mock-analytics";

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 88;
  const h = 28;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / (max - min || 1)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  );
}

const kpis = [
  {
    label: "7-day visitors",
    value: formatNumber(1219),
    trend: "+8.4%",
    up: true,
    spark: kpiSparkVisitors,
  },
  {
    label: "Show rate",
    value: formatPercent(91.2),
    trend: "+2.1%",
    up: true,
    spark: kpiSparkShowRate,
  },
  {
    label: "Live presence",
    value: formatNumber(76),
    trend: "−3 on site",
    up: false,
    spark: kpiSparkPresence,
  },
] as const;

export function AnalyticsSection() {
  return (
    <section id="analytics" className="relative py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-cobalt uppercase">
          Analytics & insights
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Operational metrics security and HR already recognize
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
          Illustrative operational signals — visitor volume, show rate, and punch
          health — styled like production desk dashboards.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                  <p className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {kpi.value}
                  </p>
                </div>
                <Sparkline
                  points={[...kpi.spark]}
                  color={kpi.up ? "#059669" : "#e11d48"}
                />
              </div>
              <span
                className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  kpi.up
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {kpi.trend}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-2xl p-5"
          >
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-ink">
                Visitor volume (7 days)
              </h3>
              <span className="text-xs font-medium text-slate-500">Expected vs arrived</span>
            </div>
            <AreaChart
              data={visitorSeries}
              aspectRatio="16 / 9"
              className="w-full"
              margin={{ top: 12, right: 12, bottom: 28, left: 12 }}
            >
              <Grid horizontal />
              <Area
                dataKey="expected"
                fill="#94a3b8"
                stroke="#64748b"
                fillOpacity={0.25}
              />
              <Area
                dataKey="visitors"
                fill="#2563eb"
                stroke="#1d4ed8"
                fillOpacity={0.35}
              />
              <XAxis />
              <ChartTooltip />
            </AreaChart>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="glass-strong rounded-2xl p-5"
          >
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-ink">Punch throughput</h3>
              <span className="text-xs font-medium text-slate-500">Punch events / day</span>
            </div>
            <LineChart
              data={attendanceSeries}
              aspectRatio="16 / 9"
              className="w-full"
              margin={{ top: 12, right: 12, bottom: 28, left: 12 }}
            >
              <Grid horizontal />
              <Line dataKey="punches" stroke="#2563eb" strokeWidth={2.5} />
              <XAxis />
              <ChartTooltip />
            </LineChart>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
