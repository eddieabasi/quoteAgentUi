import Image from "next/image";
import WorldMap from "./components/WorldMap";
import DockieCopilotSidebar from "./components/DockieCopilotSidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen font-sans" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)" }}>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-center gap-2 px-6 py-5 shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/80">
          <Image
            src="/dockie_logo.svg"
            alt="Dockie"
            width={36}
            height={36}
            className="h-9 w-auto"
          />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 pt-6">
          <div className="w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-xl border border-slate-200/60">
            <WorldMap />
          </div>
          <p className="mt-6 text-sm font-medium text-slate-600 tracking-wide">
            Your logistics assistant that never sleeps
          </p>
        </div>
      </div>

      <DockieCopilotSidebar />
    </div>
  );
}
