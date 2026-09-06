import { useState, useCallback, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { records, studyCountries, filterOptions, FilterKey, CountryRecord } from "./data";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Aggregate: if country has multiple records, combine their values
function getCountryValue(isoNumeric: number, key: FilterKey): string | boolean | null {
  const countryRecords = records.filter(r => r.isoNumeric === isoNumeric);
  if (!countryRecords.length) return null;
  const vals = countryRecords.map(r => r[key as keyof CountryRecord]);
  // If any is truthy/non-null, return that
  const nonNull = vals.filter(v => v !== null && v !== undefined);
  if (!nonNull.length) return null;
  // For booleans, true wins
  if (typeof nonNull[0] === "boolean") return nonNull.some(v => v === true) ? true : false;
  // For categoricals, pick unique values
  const unique = [...new Set(nonNull.map(String))];
  return unique.join(" / ");
}

// Color mapping for categorical values
const CATEGORICAL_PALETTES: Record<string, Record<string, string>> = {
  technique: { MB: "#2dd4bf", Bass: "#818cf8", null: "#374151" },
  frequencyPerDay: { "2": "#2dd4bf", "≥2": "#fbbf24" },
  durationMinutes: { "2": "#2dd4bf", "2–3": "#818cf8", "2-3": "#818cf8" },
  strokeTechnique: { C: "#2dd4bf", U: "#818cf8", B: "#fbbf24", "C/U": "#5eead4", "B/C": "#a78bfa", "C / B/C": "#a78bfa" },
  toothbrushType: { S: "#2dd4bf", M: "#fbbf24", "S/M": "#818cf8" },
  replaceAfterMonths: { "3": "#2dd4bf", "3–4": "#fbbf24", "3-4": "#fbbf24", "2–3": "#818cf8", "2-3": "#818cf8" },
};

function getColorForValue(key: FilterKey, value: string | boolean | null, type: "boolean" | "categorical"): string {
  if (value === null || value === undefined) return "#1a2744";
  if (type === "boolean") {
    return value === true ? "#2dd4bf" : "#374151";
  }
  // categorical
  const palette = CATEGORICAL_PALETTES[key];
  if (!palette) return "#2dd4bf";
  const strVal = String(value);
  // Try exact match first
  if (palette[strVal]) return palette[strVal];
  // Try partial match
  for (const [k, c] of Object.entries(palette)) {
    if (strVal.includes(k) || k.includes(strVal)) return c;
  }
  return "#818cf8";
}

function getLegendItems(key: FilterKey, type: "boolean" | "categorical") {
  if (type === "boolean") {
    return [
      { label: "Recommended", color: "#2dd4bf" },
      { label: "Not mentioned", color: "#374151" },
      { label: "Not in study", color: "#0f1e3d" },
    ];
  }
  const palette = CATEGORICAL_PALETTES[key];
  if (!palette) return [];
  const items = Object.entries(palette)
    .filter(([k]) => k !== "null")
    .map(([k, color]) => ({ label: k, color }));
  items.push({ label: "Not mentioned", color: "#374151" });
  items.push({ label: "Not in study", color: "#0f1e3d" });
  return items;
}

function FieldRow({ label, value }: { label: string; value: string | boolean | null }) {
  if (value === null || value === undefined) return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  const isPos = value === true || (typeof value === "string" && value.length > 0);
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-slate-400 text-xs">{label}</span>
      <span
        className="text-xs font-mono font-medium px-2 py-0.5 rounded"
        style={{
          background: isPos ? "rgba(45,212,191,0.12)" : "rgba(255,255,255,0.05)",
          color: isPos ? "#2dd4bf" : "#94a3b8",
        }}
      >
        {display}
      </span>
    </div>
  );
}

function CountryModal({ isoNumeric, onClose }: { isoNumeric: number; onClose: () => void }) {
  const name = studyCountries[isoNumeric];
  const countryRecords = records.filter(r => r.isoNumeric === isoNumeric);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,14,30,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border"
        style={{ background: "#0f1e3d", borderColor: "rgba(45,212,191,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ background: "#0f1e3d", borderColor: "rgba(45,212,191,0.15)" }}>
          <div>
            <h2 className="text-xl font-serif text-white">{name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {countryRecords.map(r => r.assocType).join(" · ")} recommendations
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {countryRecords.map((rec) => (
            <div key={rec.assocType}>
              <div
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf" }}
              >
                {rec.assocType === "DA" ? "Dental Association" : "Dental Hygienist Association"}
              </div>

              <div className="space-y-0">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Website</div>
                <FieldRow label="Text on website" value={rec.textOnWebsite} />
                <FieldRow label="Pictures on website" value={rec.picturesOnWebsite} />
                <FieldRow label="Video on website" value={rec.videoOnWebsite} />

                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-4 mb-2">Technique</div>
                <FieldRow label="Brushing technique" value={rec.technique} />
                <FieldRow label="Frequency per day" value={rec.frequencyPerDay} />
                <FieldRow label="Duration (minutes)" value={rec.durationMinutes} />
                <FieldRow label="Brush gently" value={rec.brushGently} />
                <FieldRow label="Angle of 45°" value={rec.angle45} />
                <FieldRow label="Stroke technique" value={rec.strokeTechnique} />
                <FieldRow label="Brush morning & night" value={rec.brushMorningNight} />
                <FieldRow label="Brush after every meal" value={rec.brushAfterEveryMeal} />
                <FieldRow label="Bedtime brush most important" value={rec.brushBedbedtimeMostImportant} />

                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-4 mb-2">Toothbrush</div>
                <FieldRow label="Toothbrush type" value={rec.toothbrushType} />
                <FieldRow label="Power toothbrush" value={rec.powerToothbrush} />
                <FieldRow label="Replace after (months)" value={rec.replaceAfterMonths} />
                <FieldRow label="Replace when bristles wear" value={rec.replaceWhenBristlesWear} />
                <FieldRow label="Replace after being sick" value={rec.replaceAfterSick} />

                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-4 mb-2">Toothpaste & Extras</div>
                <FieldRow label="Use fluoride toothpaste" value={rec.useFluorideToothpaste} />
                <FieldRow label="Spit, don't rinse" value={rec.spitNotRinse} />
                <FieldRow label="Clean / brush tongue" value={rec.cleanTongue} />
                <FieldRow label="Daily floss use" value={rec.dailyFloss} />
                <FieldRow label="Daily interdental brush (IDB)" value={rec.dailyIDB} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("useFluorideToothpaste");
  const [hoveredIso, setHoveredIso] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedIso, setSelectedIso] = useState<number | null>(null);

  const currentFilter = filterOptions.find(f => f.key === activeFilter)!;

  const isoValueMap = useMemo(() => {
    const map: Record<number, string | boolean | null> = {};
    Object.keys(studyCountries).forEach(iso => {
      const num = Number(iso);
      map[num] = getCountryValue(num, activeFilter);
    });
    return map;
  }, [activeFilter]);

  const legendItems = useMemo(
    () => getLegendItems(activeFilter, currentFilter.type),
    [activeFilter, currentFilter.type]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const getCountryFill = (isoNumeric: number) => {
    if (!(isoNumeric in studyCountries)) return "#0d1a30";
    const val = isoValueMap[isoNumeric];
    if (val === null || val === undefined) return "#1e2d4a";
    return getColorForValue(activeFilter, val, currentFilter.type);
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: "#060e1e" }} onMouseMove={handleMouseMove}>
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-mono tracking-widest text-teal-400/70 uppercase mb-1">Research Visualization</p>
          <h1 className="font-serif text-3xl text-white leading-tight">
            Global Toothbrushing Recommendations
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
            Advice from professional dental associations across 16 countries — hover a country to preview, click for full details.
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="px-6 pb-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Map shows:</span>
            <div className="relative">
              <select
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value as FilterKey)}
                className="appearance-none text-sm pl-3 pr-8 py-2 rounded-lg border cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                style={{
                  background: "#0f1e3d",
                  borderColor: "rgba(45,212,191,0.3)",
                  color: "#2dd4bf",
                }}
              >
                {filterOptions.map(opt => (
                  <option key={opt.key} value={opt.key} style={{ background: "#0f1e3d", color: "#e2e8f0" }}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-teal-400 text-xs">▾</div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 ml-2">
              {legendItems.map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 px-4 pb-2 min-h-0" style={{ minHeight: 380 }}>
        <div className="max-w-7xl mx-auto h-full rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(45,212,191,0.1)", background: "#080f20" }}>
          <ComposableMap
            projection="geoNaturalEarth1"
            style={{ width: "100%", height: "100%", minHeight: 380 }}
          >
            <ZoomableGroup zoom={1}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const isoNum = Number(geo.id);
                    const inStudy = isoNum in studyCountries;
                    const isHovered = hoveredIso === isoNum && inStudy;
                    const fill = getCountryFill(isoNum);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isHovered ? "#5eead4" : fill}
                        stroke="#0d1a30"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none", cursor: inStudy ? "pointer" : "default" },
                          hover: { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={() => inStudy && setHoveredIso(isoNum)}
                        onMouseLeave={() => setHoveredIso(null)}
                        onClick={() => inStudy && setSelectedIso(isoNum)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-xs text-slate-500">{Object.keys(studyCountries).length} countries in study</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-xs text-slate-500">{records.length} association records</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-xs text-slate-500">{records.filter(r => r.assocType === "DHA").length} DHA · {records.filter(r => r.assocType === "DA").length} DA</span>
          </div>
        </div>
      </div>

      {/* Consensus note + citation */}
      <footer className="px-6 py-5 flex-shrink-0 border-t" style={{ borderColor: "rgba(45,212,191,0.08)" }}>
        <div className="max-w-7xl mx-auto space-y-3">
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.15)" }}
          >
            <div className="flex-shrink-0 text-teal-400 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="text-teal-400 font-medium">Universal consensus:</span>{" "}
              All 23 dental association records included in this study agree that teeth should be brushed{" "}
              <span className="text-white font-medium">twice daily with fluoride toothpaste</span>, regardless of country or association type.
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="text-slate-500">Source: </span>
            T. A. Elkerbout, T. M. J. A. Thomassen, F. A. van der Weijden, and D. E. Slot, "Advice and Information About Toothbrushing as Available on Websites of Professional Dental Care Associations,"{" "}
            <em>International Journal of Dental Hygiene</em> 24, no. 3 (2026): 472–480,{" "}
            <a
              href="https://doi.org/10.1111/idh.70037"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:text-teal-400 underline transition-colors"
            >
              https://doi.org/10.1111/idh.70037
            </a>
          </p>
        </div>
      </footer>

      {/* Tooltip */}
      {hoveredIso !== null && hoveredIso in studyCountries && (
        <div
          className="fixed z-40 pointer-events-none px-3 py-2 rounded-lg text-sm font-medium shadow-xl"
          style={{
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 36,
            background: "#0f1e3d",
            border: "1px solid rgba(45,212,191,0.35)",
            color: "#e2e8f0",
          }}
        >
          <span className="text-teal-400">{studyCountries[hoveredIso]}</span>
          <span className="text-slate-500 text-xs ml-2">— click for details</span>
        </div>
      )}

      {/* Country Modal */}
      {selectedIso !== null && (
        <CountryModal isoNumeric={selectedIso} onClose={() => setSelectedIso(null)} />
      )}
    </div>
  );
}
