export type AssocType = "DA" | "DHA";

export interface CountryRecord {
  country: string;
  assocType: AssocType;
  isoNumeric: number;
  textOnWebsite: boolean | null;
  picturesOnWebsite: boolean | null;
  videoOnWebsite: boolean | null;
  technique: string | null;
  frequencyPerDay: string | null;
  durationMinutes: string | null;
  brushGently: boolean | null;
  angle45: boolean | null;
  strokeTechnique: string | null;
  brushMorningNight: boolean | null;
  brushAfterEveryMeal: boolean | null;
  brushBedbedtimeMostImportant: boolean | null;
  toothbrushType: string | null;
  powerToothbrush: boolean | null;
  replaceAfterMonths: string | null;
  replaceWhenBristlesWear: boolean | null;
  replaceAfterSick: boolean | null;
  useFluorideToothpaste: boolean | null;
  spitNotRinse: boolean | null;
  cleanTongue: boolean | null;
  dailyFloss: boolean | null;
  dailyIDB: boolean | null;
}

const b = (v: string | null | undefined): boolean | null =>
  v === "+" ? true : v == null ? null : null;

const raw: Array<[string, AssocType, number, ...Array<string | null>]> = [
  ["Australia",    "DA",  36,  "+","+","+","MB","2","2","+","+","C","+",null,null,"S","+","3","+","+","+","+",null,"+",null],
  ["Canada",       "DA", 124, "+","+",null,"MB","2","2–3","+","+","C/U",null,"+","+","S",null,"3",null,null,"+",null,null,"+",null],
  ["Fiji",         "DA", 242, null,null,"+",null,"2","2",null,null,null,null,null,null,null,null,null,null,null,"+",null,null,"+",null],
  ["Ghana",        "DA", 288, "+",null,null,null,"2","2",null,null,null,null,null,null,"S/M",null,"3–4",null,null,"+","+",null,"+",null],
  ["India",        "DA", 356, "+",null,null,"MB","2","2","+","+","C","+",null,"+","S","+","3–4","+",null,"+",null,"+","+",null],
  ["Ireland",      "DA", 372, "+","+","+","MB","2","2","+","+","C","+",null,"+","M","+",null,"+",null,"+","+","+","+",null],
  ["Malaysia",     "DA", 458, "+",null,null,null,"2","2",null,null,null,null,null,null,null,null,null,null,null,"+",null,null,null,null],
  ["Namibia",      "DA", 516, "+",null,null,"MB","≥2",null,"+","+","C",null,null,"+","S","+",null,null,null,"+",null,"+","+",null],
  ["New Zealand",  "DA", 554, "+",null,"+","Bass","2","2","+","+","B","+",null,"+",null,null,"3","+",null,"+","+",null,"+","+"],
  ["Rwanda",       "DA", 646, "+",null,null,null,"≥2",null,null,null,null,null,"+","+",null,null,null,null,null,"+",null,null,"+","+"],
  ["Singapore",    "DA", 702, "+",null,"+",null,"2","2","+","+","B",null,null,null,null,null,null,null,null,"+",null,null,"+",null],
  ["South Africa", "DA", 710, "+",null,null,null,"2",null,null,null,null,null,null,null,"S","+",null,null,null,"+",null,"+","+","+"],
  ["Sri Lanka",    "DA", 144, "+",null,null,null,"2","2–3","+","+","B","+",null,"+","S","+",null,null,null,"+",null,"+",null,null],
  ["Uganda",       "DA", 800, "+",null,"+",null,"2","2",null,null,null,null,null,null,null,null,"3",null,"+","+",null,null,"+",null],
  ["UK",           "DA", 826, "+",null,"+",null,"≥2","2",null,"+","C","+",null,"+","S","+","3","+",null,"+","+","+","+","+"],
  ["USA",          "DA", 840, "+","+","+",null,"2","2","+","+","B",null,null,null,"S",null,"3–4","+",null,"+",null,"+","+","+"],
  ["Australia",    "DHA", 36, "+",null,"+","MB","2","2",null,null,null,"+",null,null,"S",null,"3","+","+","+","+","+","+","+"],
  ["Canada",       "DHA",124, "+","+","+","MB","2","2","+","+","U",null,null,"+","S",null,null,"+",null,"+","+","+","+",null],
  ["Ireland",      "DHA",372, "+","+","+",null,"2","2",null,null,null,"+",null,null,"S",null,null,null,null,"+","+",null,"+","+"],
  ["New Zealand",  "DHA",554, null,null,"+",null,"2","2",null,null,null,"+",null,null,null,null,"3","+",null,"+",null,"+","+",null],
  ["Singapore",    "DHA",702, null,null,"+","Bass","2","2","+","+","C","+",null,"+","S","+","3","+",null,"+",null,"+","+","+"],
  ["UK",           "DHA",826, "+","+",null,null,"2","2","+","+","C","+",null,"+","S/M","+","2–3","+",null,"+","+","+","+","+"],
  ["USA",          "DHA",840, "+","+",null,null,"2","2","+","+","B/C",null,null,null,"S",null,"3–4",null,null,"+",null,"+","+",null],
];

export const records: CountryRecord[] = raw.map(([country, assocType, isoNumeric, ...cols]) => ({
  country: country as string,
  assocType: assocType as AssocType,
  isoNumeric: isoNumeric as number,
  textOnWebsite: b(cols[0]),
  picturesOnWebsite: b(cols[1]),
  videoOnWebsite: b(cols[2]),
  technique: cols[3] ?? null,
  frequencyPerDay: cols[4] ?? null,
  durationMinutes: cols[5] ?? null,
  brushGently: b(cols[6]),
  angle45: b(cols[7]),
  strokeTechnique: cols[8] ?? null,
  brushMorningNight: b(cols[9]),
  brushAfterEveryMeal: b(cols[10]),
  brushBedbedtimeMostImportant: b(cols[11]),
  toothbrushType: cols[12] ?? null,
  powerToothbrush: b(cols[13]),
  replaceAfterMonths: cols[14] ?? null,
  replaceWhenBristlesWear: b(cols[15]),
  replaceAfterSick: b(cols[16]),
  useFluorideToothpaste: b(cols[17]),
  spitNotRinse: b(cols[18]),
  cleanTongue: b(cols[19]),
  dailyFloss: b(cols[20]),
  dailyIDB: b(cols[21]),
}));

// All unique countries in study with their ISO codes
export const studyCountries: Record<number, string> = {};
records.forEach(r => { studyCountries[r.isoNumeric] = r.country; });

export type FilterKey =
  | "textOnWebsite"
  | "picturesOnWebsite"
  | "videoOnWebsite"
  | "technique"
  | "frequencyPerDay"
  | "durationMinutes"
  | "brushGently"
  | "angle45"
  | "strokeTechnique"
  | "brushMorningNight"
  | "brushAfterEveryMeal"
  | "brushBedbedtimeMostImportant"
  | "toothbrushType"
  | "powerToothbrush"
  | "replaceAfterMonths"
  | "replaceWhenBristlesWear"
  | "replaceAfterSick"
  | "useFluorideToothpaste"
  | "spitNotRinse"
  | "cleanTongue"
  | "dailyFloss"
  | "dailyIDB";

export interface FilterOption {
  key: FilterKey;
  label: string;
  type: "boolean" | "categorical";
}

export const filterOptions: FilterOption[] = [
  { key: "textOnWebsite", label: "Text on website", type: "boolean" },
  { key: "picturesOnWebsite", label: "Pictures on website", type: "boolean" },
  { key: "videoOnWebsite", label: "Video on website", type: "boolean" },
  { key: "technique", label: "Brushing technique", type: "categorical" },
  { key: "frequencyPerDay", label: "Frequency per day", type: "categorical" },
  { key: "durationMinutes", label: "Duration (minutes)", type: "categorical" },
  { key: "brushGently", label: "Brush gently", type: "boolean" },
  { key: "angle45", label: "Angle of 45°", type: "boolean" },
  { key: "strokeTechnique", label: "Stroke technique", type: "categorical" },
  { key: "brushMorningNight", label: "Brush morning & night", type: "boolean" },
  { key: "brushAfterEveryMeal", label: "Brush after every meal", type: "boolean" },
  { key: "brushBedbedtimeMostImportant", label: "Bedtime brush most important", type: "boolean" },
  { key: "toothbrushType", label: "Toothbrush type", type: "categorical" },
  { key: "powerToothbrush", label: "Power toothbrush recommended", type: "boolean" },
  { key: "replaceAfterMonths", label: "Replace brush (months)", type: "categorical" },
  { key: "replaceWhenBristlesWear", label: "Replace when bristles wear", type: "boolean" },
  { key: "replaceAfterSick", label: "Replace after being sick", type: "boolean" },
  { key: "useFluorideToothpaste", label: "Use fluoride toothpaste", type: "boolean" },
  { key: "spitNotRinse", label: "Spit, don't rinse", type: "boolean" },
  { key: "cleanTongue", label: "Clean / brush tongue", type: "boolean" },
  { key: "dailyFloss", label: "Daily floss use", type: "boolean" },
  { key: "dailyIDB", label: "Daily interdental brush (IDB)", type: "boolean" },
];
