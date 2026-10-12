import { BrandLogo } from "@/components/landing/BrandLogo";

const modules = [
  { label: "Visit & Pass", href: "#visit" },
  { label: "Space & Access", href: "#access" },
  { label: "Time & Attendance", href: "#time" },
  { label: "Risk & Ops", href: "#risk" },
  { label: "Architecture", href: "#workflow" },
];

const partners = ["Honeywell", "Suprema", "Spectra", "Spintly"];

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <a href="#top" aria-label="Apertio home" className="inline-flex">
            <BrandLogo height={56} />
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
            External visitors, internal access & space booking, and employee time
            & attendance — one people model, one hardware spine.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Modules
          </p>
          <ul className="mt-3 space-y-2">
            {modules.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-slate-600 transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Collaborators
          </p>
          <ul className="mt-3 space-y-2">
            {partners.map((name) => (
              <li key={name} className="text-sm text-slate-600">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Apertio. All rights reserved.</p>
          <p>Partner marks are trademarks of their respective owners.</p>
        </div>
      </div>
    </footer>
  );
}
