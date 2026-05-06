"use client";

import { RadioEdgeDock } from "@/components/radio-edge-dock";

/** Um único player para toda a app — não desmonta ao mudar de página. */
export function RadioGlobalMount() {
  return <RadioEdgeDock variant="floating" />;
}
