"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import WorldMap from "./components/WorldMap";
import DockieCopilotSidebar from "./components/DockieCopilotSidebar";
import QuoteAnalysisCard, {
  QuoteAnalysisCardCompact,
  type QuoteAnalysisCardProps,
} from "./components/QuoteAnalysisCard";

const quoteAnalysisSchema: z.ZodType<Record<string, unknown>> = z.object({
  matched_scenario: z.string().describe("Matched shipping scenario name"),
  estimated_price: z.number().describe("Total estimated price"),
  currency: z.string().describe("ISO 4217 currency code, e.g. USD"),
  base_fee: z.number().describe("Base service fee"),
  per_km_rate: z.number().describe("Rate charged per kilometre"),
  assumed_distance_km: z.number().describe("Assumed route distance in km"),
  breakdown_lines: z
    .array(z.object({ label: z.string(), amount: z.number() }))
    .describe("Itemised cost breakdown lines"),
  confidence: z.string().describe("Confidence level: high, medium, or low"),
  confidence_explanation: z
    .string()
    .describe("Short explanation of confidence level"),
  assumptions: z
    .array(z.string())
    .describe("Assumptions made during the analysis"),
  highlights: z
    .array(z.string())
    .describe("Key highlights or recommendations"),
}) as unknown as z.ZodType<Record<string, unknown>>;

export default function Home() {
  const [analyses, setAnalyses] = useState<QuoteAnalysisCardProps[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add("dck-modal-open");
    } else {
      document.body.classList.remove("dck-modal-open");
    }

    return () => {
      document.body.classList.remove("dck-modal-open");
    };
  }, [modalOpen]);

  useFrontendTool(
    {
      agentId: "my_agent",
      name: "display_quote_analysis",
      parameters: quoteAnalysisSchema,
      followUp: false,
      handler: async (args) => {
        setAnalyses((prev) => [args as QuoteAnalysisCardProps, ...prev]);
        setModalClosing(false);
        setModalOpen(true);
        return "rendered";
      },
      render: ({ args }) => {
        if (!args.estimated_price && !args.matched_scenario) return <></>;
        return (
          <QuoteAnalysisCardCompact
            {...(args as QuoteAnalysisCardProps)}
            onExpand={() => {
              setModalClosing(false);
              setModalOpen(true);
            }}
          />
        );
      },
    },
    [analyses],
  );

  const closeModal = () => {
    if (modalClosing) return;
    setModalClosing(true);
    window.setTimeout(() => {
      setModalOpen(false);
      setModalClosing(false);
    }, 180);
  };

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 38%, #ffffff 100%)" }}
    >
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="sticky top-0 z-40 border-b border-blue-400/20 bg-[#255CF4]/95 px-4 py-2 text-center text-xs font-medium text-white backdrop-blur">
          <span className="rounded-full bg-white/18 px-2 py-0.5 text-[11px] font-semibold tracking-wide">
            New
          </span>
          <span className="ml-2">Introducing AI-assisted route planning and quote support</span>
        </div>

        <header className="px-6 pb-4 pt-5">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
            <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
              <a href="#" className="transition hover:text-slate-900">
                For Retailers
              </a>
              <a href="#" className="transition hover:text-slate-900">
                For Dealers
              </a>
              <a href="#" className="transition hover:text-slate-900">
                Blogs
              </a>
            </nav>

            <Image
              src="/dockie_logo.svg"
              alt="Dockie"
              width={96}
              height={30}
              className="h-9 w-auto"
            />

            <div className="flex items-center gap-3 text-sm font-medium">
              <a href="#" className="hidden text-slate-600 transition hover:text-slate-900 sm:inline">
                Log In
              </a>
              <button className="rounded-full bg-[#255CF4] px-4 py-2 text-white shadow-sm transition hover:bg-[#1f4fe0]">
                Get Started
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 pb-10 pt-4">
          <div className="mx-auto grid h-full w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <section className="flex max-w-xl flex-col justify-center">
              <p className="mb-4 inline-flex w-fit items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Smart logistics, simplified
              </p>
              <h1 className="max-w-lg text-5xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl md:leading-[1.02]">
                Ship with confidence,
                <span className="text-[#255CF4]"> anywhere.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Dockie uses AI to help you compare routes, manage shipment documents,
                and keep every quote moving from pickup to delivery without the stress.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="rounded-full bg-[#255CF4] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,92,244,0.22)] transition hover:bg-[#1f4fe0]">
                  Try Dockie Free
                </button>
                <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                  Watch Demo
                </button>
              </div>

              <div className="mt-10 flex items-center gap-5">
                <div className="flex -space-x-2">
                  {["A", "B", "C", "D", "E"].map((letter) => (
                    <div
                      key={letter}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-600"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-500">
                  <p className="font-semibold text-slate-900">500+ logistics teams</p>
                  <p>trust Dockie daily</p>
                </div>
              </div>

              {/* Re-open button shown after first analysis */}
              {analyses.length > 0 && !modalOpen && (
                <button
                  onClick={() => {
                    setModalClosing(false);
                    setModalOpen(true);
                  }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
                    <path d="M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 3a.75.75 0 0 1 .75.75v3.5h2a.75.75 0 0 1 0 1.5H9.25a.75.75 0 0 1-.75-.75v-4.25A.75.75 0 0 1 10 6.5Z" />
                  </svg>
                  View last quote analysis
                </button>
              )}
            </section>

            <section className="relative">
              <div className="absolute inset-x-10 top-8 h-32 rounded-full bg-blue-300/25 blur-3xl" />
              <div className="absolute -left-8 top-24 hidden h-40 w-40 rounded-full bg-blue-200/30 blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-16 hidden h-36 w-36 rounded-full bg-sky-200/30 blur-3xl lg:block" />

              <div className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-white/85 p-3 shadow-[0_28px_80px_rgba(37,92,244,0.14)] backdrop-blur">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(37,92,244,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,92,244,0.06) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    maskImage: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))",
                  }}
                />

                <div className="relative rounded-[30px] border border-slate-200/70 bg-[#eef4ff] p-3">
                  <div className="mb-3 flex items-center justify-between rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-500">
                    <span>Dockie route intelligence</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                      Live quotes
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,92,244,0.10),transparent_42%)]" />

                    <div className="pointer-events-none absolute left-6 top-7 z-10 max-w-[220px] rounded-2xl border border-white/55 bg-white/60 px-4 py-3 shadow-[0_18px_32px_rgba(15,23,42,0.08)] backdrop-blur-md">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                        Active lane
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">Lagos to Rotterdam</p>
                      <p className="mt-1 text-xs text-slate-500">Customs, ocean tracking, and handoff visibility</p>
                    </div>

                    <div className="pointer-events-none absolute right-6 top-7 z-10 rounded-2xl border border-blue-200/30 bg-[linear-gradient(180deg,rgba(37,92,244,0.88),rgba(29,78,216,0.78))] px-4 py-3 text-white shadow-[0_16px_32px_rgba(37,92,244,0.20)] backdrop-blur-md">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                        Quote status
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {analyses[0]?.estimated_price
                          ? new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: analyses[0].currency ?? "USD",
                              maximumFractionDigits: 0,
                            }).format(analyses[0].estimated_price)
                          : "$4,280"}
                      </p>
                      <p className="mt-1 text-xs text-blue-100">
                        {analyses[0] ? "From AI analysis" : "Updated 2 mins ago"}
                      </p>
                    </div>

                    <div className="aspect-[1.08/1] min-h-[440px]">
                      <WorldMap />
                    </div>

                    <div className="pointer-events-none absolute bottom-6 left-8 z-10 rounded-2xl border border-white/55 bg-white/60 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                            <path d="M3 7.75A2.75 2.75 0 0 1 5.75 5h8.38A2.75 2.75 0 0 1 16 5.73L17.64 8H19a2 2 0 0 1 2 2v4.25a1.75 1.75 0 0 1-1.75 1.75H18.5a2.5 2.5 0 0 1-5 0h-3a2.5 2.5 0 0 1-5 0h-.75A1.75 1.75 0 0 1 3 14.25V7.75Zm2 0V9h9.62l-1.42-2H5.75A.75.75 0 0 0 5 7.75ZM8 17.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Delivery confidence
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {analyses[0]?.confidence
                              ? `${analyses[0].confidence.charAt(0).toUpperCase() + analyses[0].confidence.slice(1)} confidence`
                              : "98.2% on-time projection"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-6 right-8 z-10 rounded-full border border-white/55 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
                      AI assistant active
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-center text-sm font-medium tracking-wide text-slate-600">
                Your logistics assistant that never sleeps
              </p>
            </section>
          </div>
        </main>
      </div>

      <DockieCopilotSidebar />

      {/* Quote analysis modal */}
      {modalOpen && analyses[0] && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            modalClosing ? "dck-modal-leaving" : ""
          }`}
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="dck-modal-backdrop absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="dck-modal-panel relative w-full max-w-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="dck-modal-badge">Analysis active</span>

            {/* Close button */}
            <button
              onClick={closeModal}
              className="dck-modal-close"
              aria-label="Close"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>

            <QuoteAnalysisCard {...analyses[0]} />
          </div>
        </div>
      )}
    </div>
  );
}
