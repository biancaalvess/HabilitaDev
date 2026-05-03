"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  fetchRadioRockStations,
  pickRandomStationDifferent,
  streamUrl,
  type RadioStation,
} from "@/lib/radio-browser";

const VOL_KEY = "habilitadev_radio_volume";
const MUTE_KEY = "habilitadev_radio_muted";

function readStoredVolume(): number {
  if (typeof window === "undefined") return 0.72;
  const v = window.localStorage.getItem(VOL_KEY);
  if (v == null) return 0.72;
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.72;
}

function readStoredMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MUTE_KEY) === "1";
}

/**
 * Botão fixo discreto na lateral direita: expande para volume vertical, mute e controlos mínimos da rádio.
 */
function resolveMediaHref(url: string): string {
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}

function sameMediaSrc(el: HTMLAudioElement, url: string): boolean {
  if (!url || !el.src) return false;
  try {
    return new URL(el.src).href === resolveMediaHref(url);
  } catch {
    return el.src === url;
  }
}

function syncAudioSrc(el: HTMLAudioElement, url: string) {
  if (!url) return;
  if (sameMediaSrc(el, url)) return;
  el.src = url;
  el.load();
}

export function RadioEdgeDock() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [current, setCurrent] = useState<RadioStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.72);
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playHint, setPlayHint] = useState<string | null>(null);
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVolume(readStoredVolume());
    setMuted(readStoredMuted());
  }, []);

  useEffect(() => {
    if (!loading) {
      setSlowLoading(false);
      return;
    }
    const t = window.setTimeout(() => setSlowLoading(true), 480);
    return () => window.clearTimeout(t);
  }, [loading]);

  const validStations = useMemo(
    () => stations.filter((s) => s.lastcheckok === 1 && streamUrl(s)),
    [stations]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRadioRockStations();
        if (!cancelled) setStations(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Erro ao carregar rádio."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading && validStations.length && !current) {
      const first = pickRandomStationDifferent(validStations, null);
      if (first) {
        setCurrent(first);
        const el = audioRef.current;
        if (el) syncAudioSrc(el, streamUrl(first));
      }
    }
  }, [loading, validStations, current]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted, current]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VOL_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }, [muted]);

  const togglePlay = useCallback(async () => {
    setPlayHint(null);
    const el = audioRef.current;
    if (!el || !current) return;
    const url = streamUrl(current);
    if (!url) {
      setPlayHint("Stream indisponível.");
      return;
    }
    syncAudioSrc(el, url);
    try {
      if (!el.paused) {
        el.pause();
        return;
      }
      await el.play();
    } catch {
      setIsPlaying(false);
      setPlayHint("Não foi possível reproduzir (rede ou stream).");
    }
  }, [current]);

  const shuffle = useCallback(async () => {
    setPlayHint(null);
    const wasPlaying = audioRef.current && !audioRef.current.paused;
    const next = pickRandomStationDifferent(validStations, current);
    if (!next) return;
    setCurrent(next);
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    syncAudioSrc(el, streamUrl(next));
    if (wasPlaying) {
      try {
        await el.play();
      } catch {
        setIsPlaying(false);
        setPlayHint("Não foi possível reproduzir esta estação.");
      }
    } else {
      setIsPlaying(false);
    }
  }, [validStations, current]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    el.addEventListener("ended", onEnded);
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-[100] flex flex-row items-stretch max-md:right-2 max-md:bottom-5 max-md:top-auto max-md:translate-y-0 md:right-0 md:top-1/2 md:-translate-y-1/2"
      style={{ paddingRight: "env(safe-area-inset-right, 0px)" }}
    >
      <div className="pointer-events-auto relative flex max-md:rounded-xl flex-row items-stretch overflow-hidden rounded-l-xl border border-white/[0.06] shadow-[0_6px_20px_-10px_rgba(0,0,0,0.28)]">
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.55]"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 130% 90% at 15% -10%, rgba(34, 197, 94, 0.14) 0%, transparent 52%),
              radial-gradient(ellipse 100% 70% at 105% 35%, rgba(220, 38, 38, 0.09) 0%, transparent 48%),
              radial-gradient(ellipse 90% 60% at -5% 95%, rgba(234, 179, 8, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 120% 80% at 50% 120%, rgba(2, 6, 23, 0.92) 0%, transparent 55%),
              linear-gradient(165deg, rgba(15, 23, 42, 0.88) 0%, rgba(3, 7, 18, 0.94) 100%)
            `,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 backdrop-blur-[2px]"
          aria-hidden
        />

        <div className="relative z-[1] flex flex-row items-stretch">
          <div
            id="radio-dock-panel"
            className={`flex origin-right flex-col overflow-hidden border-r border-white/[0.06] bg-zinc-950/30 backdrop-blur-md transition-[width,opacity,padding] duration-200 ease-out ${
              open
                ? "w-[9.5rem] max-w-[calc(100vw-2.5rem)] px-2.5 py-2.5 opacity-100"
                : "w-0 border-r-0 px-0 py-2.5 opacity-0"
            }`}
            aria-hidden={!open}
          >
            {open && loading ? (
              <div
                className="flex min-h-0 flex-1 flex-col gap-2.5 rounded-md border border-white/[0.04] bg-zinc-950/25 p-2 backdrop-blur-md"
                aria-busy
                aria-label="A carregar estações"
              >
                <div className="flex animate-pulse flex-col gap-2 blur-[0.3px]">
                  <div className="h-2 w-10 rounded bg-white/10" />
                  <div className="mx-auto flex h-[6.5rem] w-5 items-center justify-center rounded-full bg-white/[0.07]" />
                  <div className="h-8 w-full rounded-md bg-white/[0.08]" />
                  <div className="flex justify-center gap-2 border-t border-white/[0.06] pt-2">
                    <div className="h-7 w-7 rounded-full bg-white/[0.09]" />
                    <div className="h-7 w-7 rounded-full bg-white/[0.07]" />
                  </div>
                  <div className="h-5 w-full rounded bg-white/[0.06]" />
                </div>
                {slowLoading ? (
                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[9px] text-white/45">
                    <Loader2
                      className="h-3 w-3 shrink-0 animate-spin"
                      aria-hidden
                    />
                    <span>A sincronizar…</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {open && !loading ? (
              <div className="relative flex min-h-0 flex-1 flex-col gap-2">
                <span
                  className="pointer-events-none absolute right-0 top-0 z-[2] inline-flex items-center gap-0.5 rounded-md border border-white/[0.08] bg-black/35 px-1 py-px shadow-sm backdrop-blur-md"
                  title="Transmissão ao vivo"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-70" />
                    <span className="relative m-auto block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.65)]" />
                  </span>
                  <span className="pr-0.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/75">
                    Live
                  </span>
                </span>
                <div className="min-h-0 flex-1 pt-4">
                  <p className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">
                    Volume
                  </p>
                  <div
                    className="flex h-[6.5rem] justify-center py-0.5 [&_[data-slot=slider-track]]:w-1 [&_[data-slot=slider-track]]:bg-white/[0.1] [&_[data-slot=slider-range]]:bg-white/[0.24] [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-white/15 [&_[data-slot=slider-thumb]]:bg-zinc-200/90 [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:ring-0 [&_[data-slot=slider-thumb]]:hover:ring-2 [&_[data-slot=slider-thumb]]:hover:ring-white/10 [&_[data-slot=slider-thumb]]:focus-visible:ring-2 [&_[data-slot=slider-thumb]]:focus-visible:ring-white/15"
                  >
                    <Slider
                      orientation="vertical"
                      min={0}
                      max={100}
                      step={1}
                      value={[Math.round(volume * 100)]}
                      onValueChange={(v) => {
                        const n = v[0] ?? 0;
                        setVolume(n / 100);
                        if (n > 0 && muted) setMuted(false);
                      }}
                      className="h-full min-h-[5.5rem] w-5"
                      aria-label="Volume da rádio"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMuted((m) => !m)}
                  className="h-8 shrink-0 justify-start gap-1.5 rounded-md px-2 text-white/60 hover:bg-white/[0.08] hover:text-white/85"
                  aria-label={muted ? "Ativar som" : "Silenciar"}
                >
                  {muted ? (
                    <VolumeX className="h-3.5 w-3.5 text-white/45" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-white/40" />
                  )}
                  <span className="text-[11px] font-normal">
                    {muted ? "Mudo" : "Som"}
                  </span>
                </Button>

                <div className="flex items-center justify-center gap-1 border-t border-white/[0.07] pt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-white/75 hover:bg-white/[0.08] hover:text-white/90"
                    onClick={() => void togglePlay()}
                    disabled={!current || !streamUrl(current)}
                    aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5 pl-0.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-white/50 hover:bg-white/[0.08] hover:text-white/78"
                    onClick={() => void shuffle()}
                    disabled={validStations.length < 2}
                    aria-label="Outra rádio"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {playHint ? (
                  <p className="text-center text-[9px] leading-snug text-amber-200/55">
                    {playHint}
                  </p>
                ) : null}

                <p className="line-clamp-2 text-center text-[10px] leading-snug text-white/42">
                  {error ? error : current?.name || "—"}
                </p>
              </div>
            ) : null}
          </div>

          {open && (
            <div
              className="w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/[0.08] to-transparent"
              aria-hidden
            />
          )}

          <div
            className={`flex w-9 flex-col items-stretch gap-0.5 border-l border-white/[0.05] bg-zinc-950/35 py-1.5 backdrop-blur-md ${
              open ? "md:rounded-l-none" : "md:rounded-l-lg"
            }`}
            role="group"
            aria-label="Controlos rápidos da rádio"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mx-auto h-8 w-8 shrink-0 rounded-md text-white/85 hover:bg-white/[0.1] hover:text-white disabled:opacity-35"
              onClick={() => void togglePlay()}
              disabled={
                loading || !current || !streamUrl(current)
              }
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {loading ? (
                <Loader2
                  className="h-4 w-4 animate-spin text-white/55"
                  aria-hidden
                />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden />
              ) : (
                <Play className="h-4 w-4 pl-0.5" aria-hidden />
              )}
            </Button>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="mx-auto flex h-7 w-8 shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/75"
              aria-expanded={open}
              aria-controls="radio-dock-panel"
              title={
                open
                  ? "Fechar painel (volume e mais opções)"
                  : "Abrir painel (volume e mais opções)"
              }
            >
              {open ? (
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>

            {!open ? (
              <div className="mt-0.5 flex justify-center px-0.5">
                <span
                  className="inline-flex items-center gap-0.5 rounded border border-white/[0.08] bg-black/40 px-1 py-px backdrop-blur-sm"
                  title="Transmissão ao vivo"
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/45 opacity-75" />
                    <span className="relative m-auto block h-1 w-1 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[6.5px] font-semibold uppercase tracking-[0.12em] text-white/65">
                    Live
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="sr-only" preload="none" playsInline />
    </div>
  );
}
