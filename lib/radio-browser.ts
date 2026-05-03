/** Espelhos públicos da Radio Browser API (ordem: tentar o seguinte se DNS/rede falhar). */
const RADIO_API_BASES = [
  "https://de1.api.radio-browser.info",
  "https://fi1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
] as const;

const LIST_QS =
  "hidebroken=true&limit=120&order=votes&reverse=true" as const;

/** Várias rotas para misturar rock nacional, classic rock e reggae. */
const STATION_FETCH_PATHS = [
  `/json/stations/byname/rock?${LIST_QS}`,
  `/json/stations/byname/reggae?${LIST_QS}`,
  `/json/stations/byname/surf?hidebroken=true&limit=60&order=votes&reverse=true`,
  `/json/stations/bytag/${encodeURIComponent("classic rock")}?${LIST_QS}`,
  `/json/stations/bytag/reggae?${LIST_QS}`,
  `/json/stations/bytag/rock?${LIST_QS}`,
  `/json/stations/bytag/${encodeURIComponent("rock nacional")}?${LIST_QS}`,
] as const;

/** URL de referência (primeiro espelho + primeira rota). */
export const RADIO_BROWSER_STATIONS_URL = `${RADIO_API_BASES[0]}${STATION_FETCH_PATHS[0]}`;

export type RadioStation = {
  stationuuid?: string;
  name: string;
  country: string;
  countrycode?: string;
  url: string;
  url_resolved?: string;
  lastcheckok?: number;
  favicon?: string;
  tags?: string;
  votes?: number;
};

export function streamUrl(s: RadioStation): string {
  return (s.url_resolved || s.url || "").trim();
}

/**
 * Em páginas HTTPS o browser bloqueia áudio `http:` (mixed content).
 * Em HTTP local, aceita qualquer URL válida.
 */
export function isAudioUrlAllowedOnPage(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  try {
    const parsed = new URL(u);
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      return parsed.protocol === "https:";
    }
    return true;
  } catch {
    return false;
  }
}

/** Nomes comuns de estações FM citadas como referência de mix. */
const NAME_BRAND_RE =
  /\b(surf|kiss|mix|89\s*fm|^89\b|\b89\.|radio\s*89)\b/i;

function tagBlob(s: RadioStation): string {
  return `${s.tags || ""} ${s.name || ""}`.toLowerCase();
}

/** Prioriza classic rock, reggae e rock BR / marcas conhecidas. */
function scoreStation(s: RadioStation): number {
  let score = 0;
  const name = (s.name || "").toLowerCase();
  const tags = (s.tags || "").toLowerCase();
  const blob = tagBlob(s);

  if (NAME_BRAND_RE.test(s.name || "")) score += 85;

  if (tags.includes("classic rock") || blob.includes("classic rock"))
    score += 55;
  if (tags.includes("reggae") || name.includes("reggae")) score += 50;
  if (
    tags.includes("rock nacional") ||
    blob.includes("rock nacional") ||
    blob.includes("brazilian rock")
  )
    score += 50;
  if (tags.includes("rock") || name.includes("rock")) score += 22;
  const genreHint =
    tags.includes("rock") ||
    tags.includes("reggae") ||
    tags.includes("classic") ||
    name.includes("rock") ||
    name.includes("reggae");
  if ((s.countrycode || "").toUpperCase() === "BR") {
    score += genreHint ? 28 : 5;
  }
  if ((s.country || "").toLowerCase().includes("brazil")) {
    score += genreHint ? 18 : 4;
  }
  if (typeof s.votes === "number" && s.votes > 0) {
    score += Math.min(30, Math.log10(s.votes + 1) * 8);
  }
  if (s.lastcheckok === 1) score += 15;
  return score;
}

function mergeAndRankStations(lists: RadioStation[][]): RadioStation[] {
  const best = new Map<
    string,
    { station: RadioStation; score: number }
  >();

  for (const list of lists) {
    for (const station of list) {
      const url = streamUrl(station);
      if (!url) continue;
      const key = station.stationuuid?.trim() || url;
      const score = scoreStation(station);
      const prev = best.get(key);
      if (!prev || score > prev.score) {
        best.set(key, { station, score });
      }
    }
  }

  return [...best.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => x.station);
}

async function fetchJsonStations(url: string): Promise<RadioStation[]> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as RadioStation[]) : [];
}

/**
 * Agrega estações de várias pesquisas (rock, classic rock, reggae, BR)
 * e ordena por relevância ao mix pedido.
 */
export async function fetchRadioRockStations(): Promise<RadioStation[]> {
  let lastMessage = "Sem ligação à API de rádio.";

  for (const base of RADIO_API_BASES) {
    const urls = STATION_FETCH_PATHS.map((path) => `${base}${path}`);
    try {
      const settled = await Promise.allSettled(
        urls.map((url) => fetchJsonStations(url))
      );

      const lists: RadioStation[][] = [];
      for (let i = 0; i < settled.length; i++) {
        const r = settled[i]!;
        if (r.status === "fulfilled") lists.push(r.value);
        else lastMessage = String(r.reason);
      }

      const merged = mergeAndRankStations(lists);
      if (merged.length > 0) {
        return merged.slice(0, 250);
      }
    } catch (e) {
      lastMessage =
        e instanceof Error ? e.message : "Falha de rede ao pedir estações.";
    }
  }

  throw new Error(lastMessage);
}

export function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)]!;
}

export function pickRandomStationDifferent(
  stations: RadioStation[],
  exclude: RadioStation | null
): RadioStation | null {
  if (!stations.length) return null;
  if (!exclude || stations.length === 1) return pickRandom(stations);
  const url = streamUrl(exclude);
  const others = stations.filter((s) => streamUrl(s) !== url);
  return pickRandom(others.length ? others : stations);
}
