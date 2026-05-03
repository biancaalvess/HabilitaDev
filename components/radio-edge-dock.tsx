"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronUp,
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
  isAudioUrlAllowedOnPage,
  streamUrl,
  type RadioStation,
} from "@/lib/radio-browser";

const VOL_KEY = "habilitadev_radio_volume";
const MUTE_KEY = "habilitadev_radio_muted";

export type RadioEdgeDockVariant = "floating" | "header";

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

function DockGradientLayers() {
  return (
    <>
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
    </>
  );
}

type RadioEdgeDockProps = {
  /** `floating`: canto inferior; `header`: fila compacta + painel em dropdown (ex.: barra superior). */
  variant?: RadioEdgeDockVariant;
};

export function RadioEdgeDock({ variant = "floating" }: RadioEdgeDockProps) {
  const isHeader = variant === "header";
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
    () =>
      stations.filter((s) => {
        if (s.lastcheckok !== 1) return false;
        const u = streamUrl(s);
        return Boolean(u && isAudioUrlAllowedOnPage(u));
      }),
    [stations]
  );

  useEffect(() => {
    if (
      !loading &&
      stations.length > 0 &&
      validStations.length === 0 &&
      typeof window !== "undefined" &&
      window.location.protocol === "https:"
    ) {
      setError(
        "Nenhuma estação com stream HTTPS — o browser bloqueia áudio HTTP nesta página."
      );
    }
  }, [loading, stations.length, validStations.length]);

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
    if (!isAudioUrlAllowedOnPage(url)) {
      setPlayHint("Stream bloqueado nesta página (HTTPS exige áudio HTTPS).");
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

  const rowBarClass = isHeader
    ? "flex flex-row flex-wrap items-center justify-center gap-0.5 bg-zinc-950/25 px-1 py-0.5 backdrop-blur-sm"
    : "flex flex-row flex-wrap items-center justify-center gap-0.5 bg-zinc-950/35 px-1 py-1 backdrop-blur-md";

  const btnIcon = isHeader
    ? "h-9 w-9 shrink-0 rounded-lg text-white/70 hover:bg-white/[0.07] hover:text-white/90 disabled:opacity-35"
    : "h-8 w-8 shrink-0 rounded-md text-white/85 hover:bg-white/[0.1] hover:text-white disabled:opacity-35";

  const btnIconMuted = isHeader
    ? "h-9 w-9 shrink-0 rounded-lg text-white/45 hover:bg-white/[0.07] hover:text-white/75 disabled:opacity-35"
    : "h-8 w-8 shrink-0 rounded-md text-white/60 hover:bg-white/[0.1] hover:text-white/90 disabled:opacity-35";

  const chevronBtn = isHeader
    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white/65"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/75";

  const iconSm = isHeader ? "h-4 w-4" : "h-3.5 w-3.5";
  const iconPlay = "h-4 w-4";

  const quickRow = (
    <div
      className={rowBarClass}
      role="group"
      aria-label="Controlos rápidos da rádio"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btnIcon}
        onClick={() => void togglePlay()}
        disabled={loading || !current || !streamUrl(current)}
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        title={isPlaying ? "Pausar" : "Reproduzir"}
      >
        {loading ? (
          <Loader2
            className={`${iconPlay} animate-spin text-white/45`}
            aria-hidden
          />
        ) : isPlaying ? (
          <Pause className={iconPlay} aria-hidden />
        ) : (
          <Play className={`${iconPlay} pl-0.5`} aria-hidden />
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btnIconMuted}
        onClick={() => void shuffle()}
        disabled={loading || validStations.length < 2}
        aria-label="Mudar de rádio"
        title="Mudar de rádio"
      >
        <Shuffle className={iconSm} aria-hidden />
      </Button>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={chevronBtn}
        aria-expanded={open}
        aria-controls="radio-dock-panel"
        title={
          open
            ? "Fechar painel (volume e mais opções)"
            : "Abrir painel (volume e mais opções)"
        }
      >
        {isHeader ? (
          open ? (
            <ChevronUp className={iconSm} aria-hidden />
          ) : (
            <ChevronDown className={iconSm} aria-hidden />
          )
        ) : open ? (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>

      <span
        className={
          isHeader
            ? "inline-flex shrink-0 items-center gap-0.5 rounded-md border border-white/[0.06] bg-black/30 px-1 py-0.5"
            : "inline-flex shrink-0 items-center gap-0.5 rounded border border-white/[0.08] bg-black/40 px-1 py-px backdrop-blur-sm"
        }
        title="Transmissão ao vivo"
      >
        <span
          className={`relative shrink-0 ${isHeader ? "flex h-1.5 w-1.5" : "flex h-1.5 w-1.5"}`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/35 opacity-75" />
          <span
            className={`relative m-auto block rounded-full bg-emerald-400/90 ${isHeader ? "h-1 w-1" : "h-1 w-1"}`}
          />
        </span>
        <span
          className={
            isHeader
              ? "pr-0.5 text-[7px] font-semibold uppercase tracking-wider text-white/50"
              : "text-[6.5px] font-semibold uppercase tracking-[0.12em] text-white/65"
          }
        >
          Live
        </span>
      </span>
    </div>
  );

  const onVolumeChange = (v: number[]) => {
    const n = v[0] ?? 0;
    setVolume(n / 100);
    if (n > 0 && muted) setMuted(false);
  };

  const panelBody: ReactNode = (
    <>
      {open && loading ? (
        <div
          className={
            isHeader
              ? "flex flex-col gap-1.5 py-1"
              : "flex min-h-0 flex-1 flex-col gap-2.5 rounded-md border border-white/[0.04] bg-zinc-950/25 p-2 backdrop-blur-md"
          }
          aria-busy
          aria-label="A carregar estações"
        >
          <div
            className={`flex animate-pulse flex-col blur-[0.3px] ${isHeader ? "gap-1.5" : "gap-2"}`}
          >
            <div
              className={`rounded bg-white/10 ${isHeader ? "h-1.5 w-8" : "h-2 w-10"}`}
            />
            {isHeader ? (
              <div className="h-2 w-full rounded-full bg-white/[0.07]" />
            ) : (
              <div className="mx-auto flex h-[6.5rem] w-5 items-center justify-center rounded-full bg-white/[0.07]" />
            )}
            {!isHeader ? (
              <>
                <div className="h-8 w-full rounded-md bg-white/[0.08]" />
                <div className="flex justify-center gap-2 border-t border-white/[0.06] pt-2">
                  <div className="h-7 w-7 rounded-full bg-white/[0.09]" />
                  <div className="h-7 w-7 rounded-full bg-white/[0.07]" />
                </div>
                <div className="h-5 w-full rounded bg-white/[0.06]" />
              </>
            ) : null}
          </div>
          {slowLoading ? (
            <div
              className={`flex items-center justify-center gap-1 text-white/35 ${isHeader ? "text-[8px]" : "pt-1 text-[9px] text-white/45"}`}
            >
              <Loader2
                className={`shrink-0 animate-spin ${isHeader ? "h-2.5 w-2.5" : "h-3 w-3"}`}
                aria-hidden
              />
              <span>A sincronizar…</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {open && !loading && isHeader ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="sr-only">Volume</span>
            <Volume2
              className="h-3.5 w-3.5 shrink-0 text-white/30"
              aria-hidden
            />
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(volume * 100)]}
              onValueChange={onVolumeChange}
              className="min-w-0 flex-1 py-1.5 [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:rounded-full [&_[data-slot=slider-track]]:bg-white/[0.08] [&_[data-slot=slider-range]]:rounded-full [&_[data-slot=slider-range]]:bg-white/22 [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-white/90 [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:ring-0"
              aria-label="Volume da rádio"
            />
          </div>

          <div className="flex items-center gap-1.5 border-t border-white/[0.05] pt-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMuted((m) => !m)}
              className="h-8 w-8 shrink-0 rounded-md text-white/38 hover:bg-white/[0.07] hover:text-white/70"
              aria-label={muted ? "Ativar som" : "Silenciar"}
              title={muted ? "Som desligado" : "Som ligado"}
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden />
              )}
            </Button>
            <p
              className="min-w-0 flex-1 truncate text-[10px] font-medium leading-snug text-white/45"
              title={error || current?.name || undefined}
            >
              {error ? error : current?.name || "—"}
            </p>
          </div>

          {playHint ? (
            <p className="line-clamp-2 text-[8px] leading-snug text-amber-200/45">
              {playHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {open && !loading && !isHeader ? (
        <div className="relative flex min-h-0 flex-1 flex-col gap-2">
          <div className="min-h-0 flex-1">
            <p className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">
              Volume
            </p>
            <div
              className="flex h-[5.25rem] justify-center py-0.5 [&_[data-slot=slider-track]]:w-1 [&_[data-slot=slider-track]]:bg-white/[0.1] [&_[data-slot=slider-range]]:bg-white/[0.24] [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-white/15 [&_[data-slot=slider-thumb]]:bg-zinc-200/90 [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:ring-0 [&_[data-slot=slider-thumb]]:hover:ring-2 [&_[data-slot=slider-thumb]]:hover:ring-white/10 [&_[data-slot=slider-thumb]]:focus-visible:ring-2 [&_[data-slot=slider-thumb]]:focus-visible:ring-white/15"
            >
              <Slider
                orientation="vertical"
                min={0}
                max={100}
                step={1}
                value={[Math.round(volume * 100)]}
                onValueChange={onVolumeChange}
                className="h-full min-h-[4.25rem] w-5"
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
    </>
  );

  if (!mounted) {
    return null;
  }

  const audioEl = (
    <audio ref={audioRef} className="sr-only" preload="none" playsInline />
  );

  if (isHeader) {
    return (
      <div className="relative z-[60] shrink-0">
        <div className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/[0.06] bg-slate-950/40 shadow-sm backdrop-blur-sm">
          <DockGradientLayers />
          <div className="relative z-[1]">{quickRow}</div>
        </div>

        {open ? (
          <div
            id="radio-dock-panel"
            className="pointer-events-auto absolute right-0 top-full z-[70] mt-1.5 max-h-[min(18rem,calc(100dvh-5rem))] w-[10rem] max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-xl border border-white/[0.07] bg-slate-950/92 shadow-lg backdrop-blur-md"
            role="dialog"
            aria-label="Volume e informações da rádio"
          >
            <div className="relative">
              <DockGradientLayers />
              <div className="relative z-[1] flex flex-col bg-zinc-950/20 px-3 py-2 backdrop-blur-sm">
                {panelBody}
              </div>
            </div>
          </div>
        ) : null}

        {audioEl}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-md:bottom-3 max-md:right-3 flex-col items-end"
      style={{
        paddingRight: "max(0px, env(safe-area-inset-right, 0px))",
        paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className={`pointer-events-auto relative flex flex-col items-stretch overflow-hidden rounded-xl border border-white/[0.06] shadow-[0_6px_20px_-10px_rgba(0,0,0,0.28)] transition-[width] duration-200 ease-out ${
          open
            ? "w-[9.5rem] max-w-[min(9.5rem,calc(100vw-1.5rem))]"
            : "w-auto"
        }`}
      >
        <DockGradientLayers />

        <div className="relative z-[1] flex flex-col items-stretch">
          <div
            id="radio-dock-panel"
            className={`flex flex-col overflow-hidden bg-zinc-950/30 backdrop-blur-md transition-[max-height,opacity,padding,border-color] duration-200 ease-out ${
              open
                ? "max-h-[min(28rem,calc(100vh-6rem))] border-b border-white/[0.06] px-2.5 py-2.5 opacity-100"
                : "max-h-0 border-b-0 px-0 py-0 opacity-0"
            }`}
            aria-hidden={!open}
          >
            {panelBody}
          </div>

          {quickRow}
        </div>
      </div>

      {audioEl}
    </div>
  );
}
