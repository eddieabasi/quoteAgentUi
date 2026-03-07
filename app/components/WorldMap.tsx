"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

const WORLD_TOPOLOGY_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const VehicleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 013 0 1.5 1.5 0 01-1.5 1.5zM6 18.5A1.5 1.5 0 014.5 17a1.5 1.5 0 013 0A1.5 1.5 0 016 18.5zM4 11l2-4h12l2 4m-4-4v4m4 0v6H4v-6h4m-2 0h4" />
  </svg>
);

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [geographies, setGeographies] = useState<GeoJSON.FeatureCollection | null>(null);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const projectionRef = useRef<GeoProjection | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_TOPOLOGY_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        if (cancelled) return;
        const countries = feature(topology, topology.objects.countries as GeometryCollection);
        setGeographies(countries);
      })
      .catch(() => setGeographies(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg || !geographies) return;

    const { width, height } = container.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;

    const projection = geoOrthographic()
      .fitExtent(
        [
          [width * 0.05, height * 0.05],
          [width * 0.95, height * 0.95],
        ],
        { type: "Sphere" }
      )
      .rotate([rotation[0], rotation[1]]);

    projectionRef.current = projection;
    const pathGenerator = geoPath().projection(projection);

    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));

    const ocean = svg.querySelector("[data-ocean]");
    if (ocean && ocean instanceof SVGPathElement) {
      ocean.setAttribute("d", pathGenerator({ type: "Sphere" }) ?? "");
    }

    const g = svg.querySelector("[data-countries]");
    if (!g) return;
    g.innerHTML = "";

    geographies.features.forEach((feat) => {
      const id = feat.id ?? feat.properties?.name ?? "";
      const path = pathGenerator(feat);
      if (!path) return;
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", path);
      pathEl.setAttribute("data-id", String(id));
      pathEl.setAttribute("fill", "#ffffff");
      pathEl.setAttribute("stroke", hoverId === id || selectedId === id ? "#2563eb" : "#e2e8f0");
      pathEl.setAttribute("stroke-width", selectedId === id ? "1.5" : "0.5");
      pathEl.style.cursor = "pointer";
      pathEl.addEventListener("mouseenter", () => setHoverId(String(id)));
      pathEl.addEventListener("mouseleave", () => setHoverId(null));
      pathEl.addEventListener("click", () => {
        setSelectedId(selectedId === id ? null : String(id));
        setLabel(feat.properties?.name ?? null);
      });
      g.appendChild(pathEl);
    });
  }, [geographies, rotation, selectedId, hoverId]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(draw);
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    const animate = () => {
      setRotation((r) => [r[0] + 0.15, r[1]]);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden">
      <div ref={containerRef} className="absolute inset-0">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-pointer"
          style={{ background: "#eff6ff" }}
        >
          <path data-ocean fill="#eff6ff" stroke="#bfdbfe" strokeWidth={0.5} />
          <g data-countries />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="globe-orbit-ring w-[86%] h-[86%] max-w-[86%] max-h-[86%] aspect-square">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#2563eb]/50" />
            {[0, 72, 144, 216, 288].map((deg) => (
              <div
                key={deg}
                className="absolute w-6 h-6 text-[#2563eb] drop-shadow-sm"
                style={{
                  left: "50%",
                  top: "0%",
                  transform: `rotate(${deg}deg) translateY(-50%)`,
                  marginLeft: -12,
                  marginTop: -12,
                }}
              >
                <VehicleIcon className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>
        {label && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-blue-100">
              {label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
