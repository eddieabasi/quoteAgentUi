"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoDistance, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

const WORLD_TOPOLOGY_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const HOTSPOTS = [
  {
    key: "Nigeria",
    label: "Lagos",
    country: "Nigeria",
    countryCode: "NG",
    coordinates: [3.3792, 6.5244] as [number, number],
  },
  {
    key: "Netherlands",
    label: "Rotterdam",
    country: "Netherlands",
    countryCode: "NL",
    coordinates: [4.4777, 51.9244] as [number, number],
  },
  {
    key: "United Arab Emirates",
    label: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    coordinates: [55.2708, 25.2048] as [number, number],
  },
];

function getFeatureKey(featureItem: GeoJSON.Feature) {
  const props = featureItem.properties as { name?: string } | undefined;
  return props?.name ?? String(featureItem.id ?? "");
}

function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [geographies, setGeographies] = useState<GeoJSON.FeatureCollection | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
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
    const svg = svgRef.current;
    const { width, height } = dimensions;
    if (!svg || !geographies || width <= 0 || height <= 0) return;

    const projection = geoOrthographic()
      .fitExtent(
        [
          [width * 0.05, height * 0.05],
          [width * 0.95, height * 0.95],
        ],
        { type: "Sphere" }
      )
      .rotate([rotation[0], rotation[1]]);
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
      const id = getFeatureKey(feat);
      const path = pathGenerator(feat);
      if (!path) return;
      const isSelected = selectedId === id;
      const isHover = hoverId === id;
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", path);
      pathEl.setAttribute("data-id", String(id));
      pathEl.setAttribute(
        "fill",
        isSelected ? "#93c5fd" : isHover ? "#bfdbfe" : "#ffffff"
      );
      pathEl.setAttribute(
        "stroke",
        isSelected ? "#1d4ed8" : isHover ? "#2563eb" : "#e2e8f0"
      );
      pathEl.setAttribute(
        "stroke-width",
        isSelected ? "2.5" : isHover ? "1.5" : "0.5"
      );
      pathEl.style.cursor = "pointer";
      pathEl.addEventListener("mouseenter", () => setHoverId(String(id)));
      pathEl.addEventListener("mouseleave", () => setHoverId(null));
      pathEl.addEventListener("click", () => {
        const nextId = selectedId === id ? null : String(id);
        setSelectedId(nextId);
      });
      g.appendChild(pathEl);
    });
  }, [dimensions, geographies, rotation, selectedId, hoverId]);

  const markers = useMemo(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return [];

    const projection: GeoProjection = geoOrthographic()
      .fitExtent(
        [
          [width * 0.05, height * 0.05],
          [width * 0.95, height * 0.95],
        ],
        { type: "Sphere" }
      )
      .rotate([rotation[0], rotation[1]]);

    const center: [number, number] = [-rotation[0], -rotation[1]];

    return HOTSPOTS.flatMap((hotspot) => {
      const isVisible = geoDistance(hotspot.coordinates, center) < Math.PI / 2;
      const projected = projection(hotspot.coordinates);
      if (!isVisible || !projected) return [];
      return [
        {
          key: hotspot.country,
          label: hotspot.label,
          country: hotspot.country,
          countryCode: hotspot.countryCode,
          x: projected[0],
          y: projected[1],
        },
      ];
    });
  }, [dimensions, rotation]);

  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.key === selectedId) ?? null,
    [markers, selectedId]
  );

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateDimensions = () => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

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
        {markers.map((marker) => {
          const active = selectedId === marker.key || hoverId === marker.key;
          return (
            <button
              key={marker.key}
              type="button"
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: marker.x, top: marker.y }}
              onMouseEnter={() => {
                setHoverId(marker.key);
              }}
              onMouseLeave={() => {
                setHoverId(null);
              }}
              onClick={() => {
                const nextId = selectedId === marker.key ? null : marker.key;
                setSelectedId(nextId);
              }}
              aria-label={marker.label}
            >
              <span
                className={`relative flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  active ? "border-blue-700 bg-blue-600" : "border-white bg-blue-500"
                } shadow-[0_0_0_6px_rgba(37,92,244,0.15)] transition`}
              >
                <span className="absolute h-8 w-8 rounded-full bg-blue-400/20" />
              </span>
            </button>
          );
        })}
        {selectedMarker && (
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-full"
            style={{ left: selectedMarker.x, top: selectedMarker.y - 12 }}
          >
            <div className="rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-semibold text-slate-800 shadow-md ring-1 ring-blue-200 whitespace-nowrap">
              <span className="mr-1" aria-hidden>
                {countryCodeToFlag(selectedMarker.countryCode)}
              </span>
              {selectedMarker.country}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
