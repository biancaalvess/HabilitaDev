import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        cubeMove: {
          "0%": {
            transform: "translateY(0) scale(1) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-10%) scale(1.05) rotate(0.5deg)",
          },
          "100%": {
            transform: "translateY(-20%) scale(1.02) rotate(1deg)",
          },
        },
        floatShape: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "33%": {
            transform: "translateY(-20px) rotate(120deg)",
          },
          "66%": {
            transform: "translateY(10px) rotate(240deg)",
          },
        },
        floatRibbon: {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg) scale(1)",
          },
          "25%": {
            transform: "translateY(-20px) rotate(5deg) scale(1.05)",
          },
          "50%": {
            transform: "translateY(-10px) rotate(-3deg) scale(0.95)",
          },
          "75%": {
            transform: "translateY(-30px) rotate(2deg) scale(1.02)",
          },
        },
        shimmer: {
          "0%, 100%": {
            transform: "translateX(-100%) translateY(-100%) rotate(45deg)",
          },
          "50%": {
            transform: "translateX(100%) translateY(100%) rotate(45deg)",
          },
        },
        floatParticle: {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "translateY(-30px) scale(1.2)",
            opacity: "1",
          },
        },
        floatHelmet: {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-15px) rotate(2deg)",
          },
        },
        floatJacket: {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-10px) rotate(-1deg)",
          },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.8)",
          },
        },
        wireFloat: {
          "0%, 100%": {
            transform: "translateY(0) scaleY(1)",
          },
          "50%": {
            transform: "translateY(-5px) scaleY(1.2)",
          },
        },
        shimmerJacket: {
          "0%, 100%": {
            transform: "translateX(-100%) translateY(-100%) rotate(45deg)",
          },
          "50%": {
            transform: "translateX(100%) translateY(100%) rotate(45deg)",
          },
        },
        neonPulse: {
          "0%, 100%": {
            opacity: "0.3",
            boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)",
          },
          "50%": {
            opacity: "1",
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.8)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cube-move": "cubeMove 20s ease-in-out infinite alternate",
        "float-shape": "floatShape 15s ease-in-out infinite",
        "float-ribbon": "floatRibbon 20s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "float-particle": "floatParticle 12s ease-in-out infinite",
        "float-helmet": "floatHelmet 15s ease-in-out infinite",
        "float-jacket": "floatJacket 18s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "wire-float": "wireFloat 3s ease-in-out infinite",
        "shimmer-jacket": "shimmerJacket 4s ease-in-out infinite",
        "neon-pulse": "neonPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

