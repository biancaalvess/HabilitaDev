"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/hero-section";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if URL has #questoes hash
    if (window.location.hash === "#questoes") {
      router.push("/questoes");
    }
  }, [router]);

  // Always show landing page
  return <HeroSection onStartTraining={() => {}} />;
}
